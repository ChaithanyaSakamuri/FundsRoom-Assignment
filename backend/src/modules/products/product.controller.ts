import { Request, Response, NextFunction } from 'express';
import { ProductService } from './product.service';
import { createProductSchema, updateProductSchema } from './product.validation';
import { AuthRequest } from '../../middleware/auth';

const service = new ProductService();
const qp = (val: any): string => Array.isArray(val) ? val[0] : String(val || '');
const pid = (val: any): string => String(val);

export const getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await service.getAll({
      search: qp(req.query.search),
      category: qp(req.query.category),
      status: qp(req.query.status),
      page: req.query.page ? parseInt(qp(req.query.page)) : 1,
      limit: req.query.limit ? parseInt(qp(req.query.limit)) : 20,
      sortBy: qp(req.query.sortBy),
      sortOrder: qp(req.query.sortOrder) as 'asc' | 'desc',
    });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

export const getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await service.getById(pid(req.params.id));
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = createProductSchema.parse(req.body);
    const product = await service.create(data, req.user!.id);
    res.status(201).json({ success: true, data: product });
  } catch (err) { next(err); }
};

export const update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = updateProductSchema.parse(req.body);
    const product = await service.update(pid(req.params.id), data, req.user!.id);
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
};

export const remove = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await service.delete(pid(req.params.id), req.user!.id);
    res.json({ success: true, message: 'Product archived.' });
  } catch (err) { next(err); }
};

export const getCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await service.getCategories();
    res.json({ success: true, data: categories });
  } catch (err) { next(err); }
};

export const getHealthSummary = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await service.getHealthSummary();
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const results = await service.search(qp(req.query.q));
    res.json({ success: true, data: results });
  } catch (err) { next(err); }
};
