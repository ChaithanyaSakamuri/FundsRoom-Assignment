import { Response, NextFunction } from 'express';
import { StockMovementService } from './stockMovement.service';
import { AuthRequest } from '../../middleware/auth';

const service = new StockMovementService();

export const getAll = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId, type, page, limit } = req.query as any;
    const result = await service.getAll({
      productId: productId ? String(productId) : undefined,
      type: type ? (String(type) as 'IN' | 'OUT') : undefined,
      page: page ? parseInt(String(page)) : 1,
      limit: limit ? parseInt(String(limit)) : 20,
    });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

export const create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const movement = await service.create(req.body as any, req.user!.id);
    res.status(201).json({ success: true, data: movement });
  } catch (err) { next(err); }
};
