import { prisma } from '../../database/prisma';
import { AppError } from '../../middleware/errorHandler';
import PDFDocument from 'pdfkit';
import { Response } from 'express';

async function getNextChallanNumber(): Promise<string> {
  const count = await prisma.challan.count();
  const nextNum = (count + 1).toString().padStart(5, '0');
  return `CH-${nextNum}`;
}

export class ChallanService {
  async getAll(params: {
    search?: string;
    status?: string;
    customerId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.search) {
      where.OR = [
        { challanNumber: { contains: params.search } },
        { customer: { name: { contains: params.search } } },
        { customer: { business: { contains: params.search } } },
      ];
    }

    if (params.status) {
      where.status = params.status;
    }

    if (params.customerId) {
      where.customerId = params.customerId;
    }

    const [challans, total] = await Promise.all([
      prisma.challan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true, business: true, phone: true } },
          createdBy: { select: { name: true, role: true } },
          _count: { select: { items: true } },
        },
      }),
      prisma.challan.count({ where }),
    ]);

    return {
      data: challans,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string) {
    const challan = await prisma.challan.findUnique({
      where: { id },
      include: {
        customer: true,
        createdBy: { select: { name: true, role: true, email: true } },
        items: {
          include: {
            product: { select: { name: true, sku: true, unit: true } },
          },
        },
      },
    });

    if (!challan) throw new AppError('Challan not found.', 404);

    // Parse productSnapshot if string
    const items = challan.items.map((item: any) => ({
      ...item,
      productSnapshot: typeof item.productSnapshot === 'string' ? JSON.parse(item.productSnapshot) : item.productSnapshot,
    }));

    return { ...challan, items };
  }

  async create(
    data: {
      customerId: string;
      notes?: string;
      items: Array<{ productId: string; quantity: number; unitPrice: number }>;
    },
    userId: string
  ) {
    const customer = await prisma.customer.findUnique({ where: { id: data.customerId } });
    if (!customer) throw new AppError('Customer not found.', 404);

    const products = await Promise.all(
      data.items.map((item) => prisma.product.findUnique({ where: { id: item.productId } }))
    );

    for (let i = 0; i < products.length; i++) {
      if (!products[i]) throw new AppError('Product not found.', 404);
    }

    const challanNumber = await getNextChallanNumber();

    const itemsData = data.items.map((item, i) => {
      const product = products[i]!;
      const totalPrice = item.quantity * item.unitPrice;
      return {
        productId: item.productId,
        productSnapshot: JSON.stringify({
          name: product.name,
          sku: product.sku,
          category: product.category,
          unit: product.unit,
          priceAtTime: product.price,
        }),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: totalPrice,
      };
    });

    const subtotal = itemsData.reduce((sum, item) => sum + item.totalPrice, 0);
    const grandTotal = subtotal;

    const challan = await prisma.challan.create({
      data: {
        challanNumber,
        customerId: data.customerId,
        notes: data.notes,
        subtotal: subtotal,
        grandTotal: grandTotal,
        createdById: userId,
        items: { create: itemsData },
      },
      include: {
        customer: { select: { name: true, business: true } },
        items: { include: { product: { select: { name: true, sku: true } } } },
        createdBy: { select: { name: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'CHALLAN_CREATED',
        entityType: 'Challan',
        entityId: challan.id,
        entityLabel: `Created Challan ${challan.challanNumber}`,
      },
    });

    return challan;
  }

  async confirm(id: string, userId: string) {
    const challan = await prisma.challan.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!challan) throw new AppError('Challan not found.', 404);
    if (challan.status !== 'DRAFT') {
      throw new AppError(`Challan is already ${challan.status.toLowerCase()}.`, 400);
    }

    return await prisma.$transaction(async (tx) => {
      for (const item of challan.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) {
          throw new AppError(`Product ID ${item.productId} not found.`, 404);
        }
        if (product.currentStock < item.quantity) {
          throw new AppError(
            `Insufficient stock for "${product.name}". Available: ${product.currentStock}, Required: ${item.quantity}`,
            400
          );
        }

        await tx.product.update({
          where: { id: item.productId },
          data: { currentStock: { decrement: item.quantity } },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: 'OUT',
            quantity: item.quantity,
            reason: 'CHALLAN_FULFILLMENT',
            reference: challan.challanNumber,
            notes: `Fulfillment for Challan ${challan.challanNumber}`,
            createdById: userId,
          },
        });
      }

      const updatedChallan = await tx.challan.update({
        where: { id },
        data: {
          status: 'CONFIRMED',
          confirmedAt: new Date(),
        },
        include: {
          customer: true,
          items: true,
        },
      });

      await tx.activityLog.create({
        data: {
          userId,
          action: 'CHALLAN_CONFIRMED',
          entityType: 'Challan',
          entityId: id,
          entityLabel: `Confirmed Challan ${challan.challanNumber} and deducted stock`,
        },
      });

      return updatedChallan;
    });
  }

  async cancel(id: string, userId: string) {
    const challan = await prisma.challan.findUnique({ where: { id } });

    if (!challan) throw new AppError('Challan not found.', 404);
    if (challan.status === 'CANCELLED') {
      throw new AppError('Challan is already cancelled.', 400);
    }
    if (challan.status === 'CONFIRMED') {
      throw new AppError(
        'Cannot cancel a confirmed challan. Confirmed challans have already updated stock ledgers.',
        400
      );
    }

    const updated = await prisma.challan.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'CHALLAN_CANCELLED',
        entityType: 'Challan',
        entityId: id,
        entityLabel: `Cancelled Challan ${challan.challanNumber}`,
      },
    });

    return updated;
  }

  async generatePDF(id: string, res: Response) {
    const challan = (await this.getById(id)) as any;

    const doc = new PDFDocument({ size: 'A4', margin: 40 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename=Challan-${challan.challanNumber}.pdf`
    );

    doc.pipe(res);

    // Header
    doc
      .fillColor('#6366f1')
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('NEXORA', 40, 40);
    doc
      .fillColor('#64748b')
      .fontSize(9)
      .font('Helvetica')
      .text('INTELLIGENT BUSINESS OPERATIONS', 40, 65);

    doc
      .fillColor('#0f172a')
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('DELIVERY CHALLAN', 380, 40, { align: 'right' });
    doc
      .fillColor('#475569')
      .fontSize(11)
      .font('Helvetica')
      .text(challan.challanNumber, 380, 60, { align: 'right' });
    doc
      .fontSize(9)
      .text(`Date: ${new Date(challan.createdAt).toLocaleDateString('en-IN')}`, 380, 75, {
        align: 'right',
      });
    doc.text(`Status: ${challan.status}`, 380, 88, { align: 'right' });

    doc.moveTo(40, 110).lineTo(555, 110).strokeColor('#cbd5e1').lineWidth(1).stroke();

    // Bill To & Issued By
    doc
      .fillColor('#475569')
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('CONSIGNEE / DELIVER TO:', 40, 125);
    doc
      .fillColor('#0f172a')
      .fontSize(11)
      .font('Helvetica-Bold')
      .text(challan.customer.name, 40, 138);
    if (challan.customer.business) {
      doc.fillColor('#475569').fontSize(10).font('Helvetica').text(challan.customer.business, 40, 152);
    }
    doc.fontSize(9).font('Helvetica').text(`Phone: ${challan.customer.phone}`, 40, 166);
    if (challan.customer.gstin) {
      doc.text(`GSTIN: ${challan.customer.gstin}`, 40, 178);
    }

    doc
      .fillColor('#475569')
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('ISSUED BY:', 320, 125);
    doc
      .fillColor('#0f172a')
      .fontSize(11)
      .font('Helvetica-Bold')
      .text(challan.createdBy?.name || 'Authorized User', 320, 138);
    doc
      .fillColor('#475569')
      .fontSize(9)
      .font('Helvetica')
      .text(`Role: ${challan.createdBy?.role || 'Operations'}`, 320, 152);

    // Items Table Header
    const tableTop = 210;
    doc.rect(40, tableTop, 515, 20).fill('#f1f5f9');
    doc
      .fillColor('#334155')
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('#', 45, tableTop + 5)
      .text('Item Description', 70, tableTop + 5)
      .text('Qty', 330, tableTop + 5, { width: 50, align: 'right' })
      .text('Unit Price', 395, tableTop + 5, { width: 70, align: 'right' })
      .text('Total (INR)', 470, tableTop + 5, { width: 80, align: 'right' });

    let y = tableTop + 26;

    challan.items.forEach((item: any, idx: number) => {
      const snap = (item.productSnapshot as any) || {};
      const name = snap.name || item.product?.name || 'Item';

      doc
        .fillColor('#0f172a')
        .fontSize(9)
        .font('Helvetica')
        .text((idx + 1).toString(), 45, y)
        .text(name, 70, y, { width: 250 })
        .text(`${item.quantity} ${snap.unit || ''}`, 330, y, { width: 50, align: 'right' })
        .text(`Rs. ${Number(item.unitPrice).toFixed(2)}`, 395, y, { width: 70, align: 'right' })
        .text(`Rs. ${Number(item.totalPrice).toFixed(2)}`, 470, y, { width: 80, align: 'right' });

      y += 20;
    });

    doc.moveTo(40, y).lineTo(555, y).strokeColor('#cbd5e1').lineWidth(0.5).stroke();
    y += 10;

    // Grand Total
    doc
      .fillColor('#0f172a')
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('Grand Total:', 370, y, { width: 95, align: 'right' })
      .text(`Rs. ${Number(challan.grandTotal).toLocaleString('en-IN')}`, 470, y, {
        width: 80,
        align: 'right',
      });

    // Notes
    if (challan.notes) {
      y += 30;
      doc
        .fillColor('#475569')
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('Notes / Remarks:', 40, y);
      doc
        .fillColor('#64748b')
        .fontSize(9)
        .font('Helvetica')
        .text(challan.notes, 40, y + 12);
    }

    // Footer
    doc
      .fillColor('#94a3b8')
      .fontSize(8)
      .font('Helvetica')
      .text(
        'This is a computer-generated delivery challan. Powered by NEXORA ERP.',
        40,
        760,
        { align: 'center', width: 515 }
      );

    doc.end();
  }

  async search(query: string) {
    if (!query || !query.trim()) return [];
    return prisma.challan.findMany({
      where: {
        OR: [
          { challanNumber: { contains: query } },
          { customer: { name: { contains: query } } },
        ],
      },
      take: 5,
      include: { customer: { select: { name: true } } },
    });
  }
}
