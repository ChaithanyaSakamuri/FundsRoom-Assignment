import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { prisma } from '../../database/prisma';
import { Request, Response, NextFunction } from 'express';

const router = Router();
router.use(authenticate);

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, avatarColor: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ success: true, data: users });
  } catch (err) { next(err); }
});

export default router;
