import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { prisma } from '../../database/prisma';
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/summary', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      totalCustomers,
      totalProducts,
      totalChallans,
      pendingFollowups,
      allActiveProducts,
      pendingChallans,
      todayChallans,
      recentActivity,
      sevenDayChallans,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.challan.count({ where: { status: 'CONFIRMED' } }),
      prisma.customerFollowup.count({
        where: { completedAt: null, dueDate: { lte: tomorrow } },
      }),
      prisma.product.findMany({
        where: { isActive: true },
        select: { id: true, name: true, sku: true, currentStock: true, minStock: true },
      }),
      prisma.challan.count({ where: { status: 'DRAFT' } }),
      prisma.challan.findMany({
        where: { status: 'CONFIRMED', confirmedAt: { gte: today } },
        select: { grandTotal: true },
      }),
      prisma.activityLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, avatarColor: true, role: true } } },
      }),
      prisma.challan.findMany({
        where: { status: 'CONFIRMED', confirmedAt: { gte: sevenDaysAgo } },
        select: { confirmedAt: true, grandTotal: true },
        orderBy: { confirmedAt: 'asc' },
      }),
    ]);

    // Low & Critical products calculated in JS (cross-DB safe)
    const lowStockProductsList = allActiveProducts.filter((p) => p.currentStock <= p.minStock);
    const lowStockProducts = lowStockProductsList.length;
    const criticalProducts = lowStockProductsList.slice(0, 5);

    // Today sales totals
    const todaySalesTotal = todayChallans.reduce((sum, ch) => sum + ch.grandTotal, 0);
    const todaySalesCount = todayChallans.length;

    // Sales trend grouped in JS
    const trendMap: Record<string, { date: string; revenue: number; count: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      trendMap[key] = { date: key, revenue: 0, count: 0 };
    }

    sevenDayChallans.forEach((ch) => {
      if (ch.confirmedAt) {
        const key = new Date(ch.confirmedAt).toISOString().split('T')[0];
        if (trendMap[key]) {
          trendMap[key].revenue += ch.grandTotal;
          trendMap[key].count += 1;
        }
      }
    });

    const salesTrend = Object.values(trendMap);

    // Overdue followups
    const overdueFollowups = await prisma.customerFollowup.findMany({
      where: { completedAt: null, dueDate: { lt: today } },
      take: 5,
      include: { customer: { select: { name: true, id: true } } },
    });

    // Draft challans
    const draftChallans = await prisma.challan.findMany({
      where: { status: 'DRAFT' },
      take: 5,
      select: {
        id: true,
        challanNumber: true,
        createdAt: true,
        customer: { select: { name: true } },
      },
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalCustomers,
          totalProducts,
          totalChallans,
          pendingFollowups,
          lowStockProducts,
          pendingChallans,
          todaySalesTotal,
          todaySalesCount,
        },
        alerts: {
          criticalProducts,
          overdueFollowups,
          draftChallans,
        },
        recentActivity,
        salesTrend,
        userName: req.user?.name || 'Admin',
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
