import { prisma } from '../../database/prisma';
import { AppError } from '../../middleware/errorHandler';

export class CustomerService {
  async getAll(params: {
    search?: string;
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { business: { contains: params.search } },
        { phone: { contains: params.search } },
        { email: { contains: params.search } },
      ];
    }

    if (params.status) {
      where.status = params.status;
    }

    if (params.type) {
      where.type = params.type;
    }

    const orderByField = params.sortBy || 'createdAt';
    const orderByDir = params.sortOrder || 'desc';

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderByField]: orderByDir },
        include: {
          createdBy: { select: { name: true, role: true } },
          _count: { select: { challans: true } },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    return {
      data: customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, role: true } },
        followups: {
          orderBy: { dueDate: 'asc' },
          include: { createdBy: { select: { name: true } } },
        },
        challans: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            challanNumber: true,
            status: true,
            grandTotal: true,
            createdAt: true,
          },
        },
        _count: { select: { challans: true } },
      },
    });

    if (!customer) throw new AppError('Customer not found.', 404);
    return customer;
  }

  async create(data: any, userId: string) {
    const customer = await prisma.customer.create({
      data: { ...data, createdById: userId },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'CUSTOMER_CREATED',
        entityType: 'Customer',
        entityId: customer.id,
        entityLabel: customer.name,
      },
    });

    return customer;
  }

  async update(id: string, data: any, userId: string) {
    await this.getById(id);
    const updated = await prisma.customer.update({
      where: { id },
      data,
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'CUSTOMER_UPDATED',
        entityType: 'Customer',
        entityId: id,
        entityLabel: updated.name,
      },
    });

    return updated;
  }

  async delete(id: string, userId: string) {
    const customer = await this.getById(id);
    await prisma.customer.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'CUSTOMER_DELETED',
        entityType: 'Customer',
        entityId: id,
        entityLabel: customer.name,
      },
    });
  }

  async createFollowup(customerId: string, data: any, userId: string) {
    await this.getById(customerId);
    return prisma.customerFollowup.create({
      data: {
        customerId,
        dueDate: new Date(data.dueDate),
        note: data.note,
        createdById: userId,
      },
    });
  }

  async updateFollowup(_customerId: string, fid: string, data: any, _userId: string) {
    return prisma.customerFollowup.update({
      where: { id: fid },
      data: {
        completedAt: data.completed ? new Date() : null,
        outcome: data.outcome,
        note: data.note,
      },
    });
  }

  async search(query: string) {
    if (!query || !query.trim()) return [];
    return prisma.customer.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { business: { contains: query } },
        ],
      },
      take: 5,
      select: { id: true, name: true, business: true, phone: true, type: true },
    });
  }
}
