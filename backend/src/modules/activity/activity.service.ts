import { prisma } from '../../database/prisma';

export class ActivityService {
  async getAll(page = 1, limit = 30) {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, role: true, avatarColor: true } },
        },
      }),
      prisma.activityLog.count(),
    ]);

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async log(userId: string, action: string, entityType: string, entityId?: string, entityLabel?: string) {
    return prisma.activityLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        entityLabel,
      },
    });
  }
}

export const logActivity = async (userId: string, action: string, entityType: string, entityId?: string, entityLabel?: string) => {
  try {
    await prisma.activityLog.create({
      data: { userId, action, entityType, entityId, entityLabel },
    });
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
};
