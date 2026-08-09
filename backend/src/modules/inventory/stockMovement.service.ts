import { prisma } from '../../database/prisma';
import { AppError } from '../../middleware/errorHandler';
import { Prisma } from '@prisma/client';
import { logActivity } from '../activity/activity.service';

export class StockMovementService {
  async getAll(query: {
    productId?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const { productId, type, startDate, endDate, page = 1, limit = 30 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.StockMovementWhereInput = {
      ...(productId && { productId }),
      ...(type && { type: type as any }),
      ...(startDate || endDate ? {
        createdAt: {
          ...(startDate && { gte: new Date(startDate) }),
          ...(endDate && { lte: new Date(endDate + 'T23:59:59') }),
        },
      } : {}),
    };

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { name: true, sku: true } },
          createdBy: { select: { name: true, role: true } },
        },
      }),
      prisma.stockMovement.count({ where }),
    ]);

    return {
      movements,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async create(data: {
    productId: string;
    type: 'IN' | 'OUT';
    quantity: number;
    reason: string;
    reference?: string;
    notes?: string;
  }, userId: string) {
    const product = await prisma.product.findUnique({ where: { id: data.productId } });
    if (!product) throw new AppError('Product not found.', 404);

    if (data.type === 'OUT' && product.currentStock < data.quantity) {
      throw new AppError(
        `Insufficient stock. Only ${product.currentStock} ${product.unit} available.`,
        400
      );
    }

    const [movement] = await prisma.$transaction([
      prisma.stockMovement.create({
        data: { ...data, createdById: userId },
        include: {
          product: { select: { name: true, sku: true } },
          createdBy: { select: { name: true } },
        },
      }),
      prisma.product.update({
        where: { id: data.productId },
        data: {
          currentStock: {
            [data.type === 'IN' ? 'increment' : 'decrement']: data.quantity,
          },
        },
      }),
    ]);

    await logActivity(
      userId,
      `recorded ${data.type} stock movement`,
      'product',
      data.productId,
      product.name
    );

    return movement;
  }
}
