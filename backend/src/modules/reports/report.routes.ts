import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth';
import { prisma } from '../../database/prisma';

const router = Router();
router.use(authenticate);

router.get('/sales-overview', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [confirmedChallans, topCustomers, totalRevenue, challansByStatus] = await Promise.all([
      prisma.challan.findMany({
        where: { status: 'CONFIRMED', confirmedAt: { gte: startDate } },
        select: { confirmedAt: true, grandTotal: true },
        orderBy: { confirmedAt: 'asc' },
      }),
      prisma.challan.groupBy({
        by: ['customerId'],
        where: { status: 'CONFIRMED', confirmedAt: { gte: startDate } },
        _sum: { grandTotal: true },
        _count: true,
        orderBy: { _sum: { grandTotal: 'desc' } },
        take: 5,
      }),
      prisma.challan.aggregate({
        where: { status: 'CONFIRMED', confirmedAt: { gte: startDate } },
        _sum: { grandTotal: true },
        _count: true,
      }),
      prisma.challan.groupBy({
        by: ['status'],
        _count: true,
      }),
    ]);

    // Group confirmed challans by date in JS
    const dayMap: Record<string, { date: string; revenue: number; count: number }> = {};
    confirmedChallans.forEach((ch) => {
      if (ch.confirmedAt) {
        const key = new Date(ch.confirmedAt).toISOString().split('T')[0];
        if (!dayMap[key]) dayMap[key] = { date: key, revenue: 0, count: 0 };
        dayMap[key].revenue += ch.grandTotal;
        dayMap[key].count += 1;
      }
    });

    const salesByDay = Object.values(dayMap);

    // Enrich top customers
    const customerIds = topCustomers.map((c) => c.customerId);
    const customers = await prisma.customer.findMany({
      where: { id: { in: customerIds } },
      select: { id: true, name: true, business: true },
    });

    const enrichedTopCustomers = topCustomers.map((tc) => ({
      ...tc,
      customer: customers.find((c) => c.id === tc.customerId),
    }));

    res.json({
      success: true,
      data: {
        salesByDay,
        topCustomers: enrichedTopCustomers,
        totalRevenue: totalRevenue._sum.grandTotal || 0,
        totalChallans: totalRevenue._count || 0,
        challansByStatus,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/inventory-health', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { currentStock: true, minStock: true, category: true, name: true, sku: true },
    });

    const byCategory: Record<string, { healthy: number; low: number; critical: number; outOfStock: number; totalStock: number; count: number }> = {};
    let healthy = 0, low = 0, critical = 0, outOfStock = 0;

    for (const p of products) {
      if (!byCategory[p.category]) {
        byCategory[p.category] = { healthy: 0, low: 0, critical: 0, outOfStock: 0, totalStock: 0, count: 0 };
      }
      byCategory[p.category].totalStock += p.currentStock;
      byCategory[p.category].count += 1;

      if (p.currentStock === 0) {
        outOfStock++;
        byCategory[p.category].outOfStock++;
      } else if (p.currentStock <= p.minStock * 0.5) {
        critical++;
        byCategory[p.category].critical++;
      } else if (p.currentStock <= p.minStock) {
        low++;
        byCategory[p.category].low++;
      } else {
        healthy++;
        byCategory[p.category].healthy++;
      }
    }

    const total = products.length;
    const healthPercent = total > 0 ? Math.round((healthy / total) * 100) : 100;

    const statusBreakdown = [
      { status: 'Healthy', count: healthy },
      { status: 'Low Stock', count: low },
      { status: 'Critical', count: critical },
      { status: 'Out of Stock', count: outOfStock },
    ];

    const categoryBreakdown = Object.entries(byCategory).map(([category, val]) => ({
      category,
      ...val,
    }));

    res.json({
      success: true,
      data: { total, healthy, low, critical, outOfStock, healthPercent, byCategory, statusBreakdown, categoryBreakdown },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/customer-activity', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [totalCustomers, newCustomers, activeCustomers, followupsDue, followupsCompleted] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({ where: { createdAt: { gte: startDate } } }),
      prisma.challan.groupBy({
        by: ['customerId'],
        where: { status: 'CONFIRMED', confirmedAt: { gte: startDate } },
      }).then((r) => r.length),
      prisma.customerFollowup.count({ where: { completedAt: null } }),
      prisma.customerFollowup.count({ where: { completedAt: { gte: startDate } } }),
    ]);

    res.json({
      success: true,
      data: { totalCustomers, newCustomers, activeCustomers, followupsDue, followupsCompleted },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/stock-movements', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const movements = await prisma.stockMovement.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true, type: true, quantity: true },
      orderBy: { createdAt: 'asc' },
    });

    const dayMap: Record<string, { date: string; in: number; out: number }> = {};
    movements.forEach((m) => {
      const key = new Date(m.createdAt).toISOString().split('T')[0];
      if (!dayMap[key]) dayMap[key] = { date: key, in: 0, out: 0 };
      if (m.type === 'IN') dayMap[key].in += m.quantity;
      else if (m.type === 'OUT') dayMap[key].out += m.quantity;
    });

    const dailyMovements = Object.values(dayMap);

    res.json({ success: true, data: { dailyMovements } });
  } catch (err) {
    next(err);
  }
});

export default router;
