import { prisma } from '../../database/prisma';
import { AppError } from '../../middleware/errorHandler';

export class ProductService {
  async getAll(params: {
    search?: string;
    category?: string;
    status?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };

    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { sku: { contains: params.search } },
        { category: { contains: params.search } },
      ];
    }

    if (params.category) {
      where.category = { contains: params.category };
    }

    const orderByField = params.sortBy || 'createdAt';
    const orderByDir = params.sortOrder || 'desc';

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderByField]: orderByDir },
      }),
      prisma.product.count({ where }),
    ]);

    const mapped = products.map((p) => {
      let stockStatus = 'HEALTHY';
      if (p.currentStock === 0) stockStatus = 'OUT_OF_STOCK';
      else if (p.currentStock <= p.minStock / 2) stockStatus = 'CRITICAL';
      else if (p.currentStock <= p.minStock) stockStatus = 'LOW';
      return { ...p, stockStatus };
    });

    return {
      data: mapped,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { createdBy: { select: { name: true, role: true } } },
        },
      },
    });

    if (!product || !product.isActive) throw new AppError('Product not found.', 404);

    let stockStatus = 'HEALTHY';
    if (product.currentStock === 0) stockStatus = 'OUT_OF_STOCK';
    else if (product.currentStock <= product.minStock / 2) stockStatus = 'CRITICAL';
    else if (product.currentStock <= product.minStock) stockStatus = 'LOW';

    return { ...product, stockStatus };
  }

  async create(data: any, userId: string) {
    const existing = await prisma.product.findUnique({ where: { sku: data.sku.toUpperCase() } });
    if (existing) throw new AppError(`SKU "${data.sku}" already exists.`, 400);

    const product = await prisma.product.create({
      data: { ...data, sku: data.sku.toUpperCase() },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'PRODUCT_CREATED',
        entityType: 'Product',
        entityId: product.id,
        entityLabel: `${product.name} (${product.sku})`,
      },
    });

    return product;
  }

  async update(id: string, data: any, userId: string) {
    await this.getById(id);
    const updated = await prisma.product.update({
      where: { id },
      data,
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'PRODUCT_UPDATED',
        entityType: 'Product',
        entityId: id,
        entityLabel: updated.name,
      },
    });

    return updated;
  }

  async delete(id: string, userId: string) {
    const product = await this.getById(id);
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'PRODUCT_ARCHIVED',
        entityType: 'Product',
        entityId: id,
        entityLabel: product.name,
      },
    });
  }

  async getCategories() {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category'],
    });
    return products.map((p) => p.category);
  }

  async getHealthSummary() {
    const products = await prisma.product.findMany({ where: { isActive: true } });
    const total = products.length;
    let healthy = 0;
    let low = 0;
    let critical = 0;
    let outOfStock = 0;

    products.forEach((p) => {
      if (p.currentStock === 0) outOfStock++;
      else if (p.currentStock <= p.minStock / 2) critical++;
      else if (p.currentStock <= p.minStock) low++;
      else healthy++;
    });

    return {
      totalProducts: total,
      healthy,
      lowStock: low,
      critical,
      outOfStock,
      healthPercentage: total > 0 ? Math.round((healthy / total) * 100) : 100,
    };
  }

  async search(query: string) {
    if (!query || !query.trim()) return [];
    return prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query } },
          { sku: { contains: query } },
        ],
      },
      take: 5,
      select: { id: true, name: true, sku: true, currentStock: true, price: true, unit: true },
    });
  }
}
