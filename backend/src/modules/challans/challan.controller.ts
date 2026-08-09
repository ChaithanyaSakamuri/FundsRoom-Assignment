import { Request, Response, NextFunction } from 'express';
import { ChallanService } from './challan.service';
import { createChallanSchema } from './challan.validation';
import { AuthRequest } from '../../middleware/auth';

const service = new ChallanService();
const q = (val: any): string => Array.isArray(val) ? val[0] : String(val || '');
const id = (val: any): string => String(val);

export const getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await service.getAll({
      search: q(req.query.search),
      status: q(req.query.status),
      customerId: q(req.query.customerId),
      page: req.query.page ? parseInt(q(req.query.page)) : 1,
      limit: req.query.limit ? parseInt(q(req.query.limit)) : 20,
    });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

export const getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await service.getById(id(req.params.id));
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = createChallanSchema.parse(req.body);
    const challan = await service.create(data as any, req.user!.id);
    res.status(201).json({ success: true, data: challan });
  } catch (err) { next(err); }
};

export const confirm = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const challan = await service.confirm(id(req.params.id), req.user!.id);
    res.json({ success: true, data: challan, message: 'Challan confirmed successfully. Stock has been updated.' });
  } catch (err) { next(err); }
};

export const cancel = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const challan = await service.cancel(id(req.params.id), req.user!.id);
    res.json({ success: true, data: challan, message: 'Challan cancelled.' });
  } catch (err) { next(err); }
};

export const downloadPDF = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await service.generatePDF(id(req.params.id), res);
  } catch (err) { next(err); }
};

export const search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const results = await service.search(q(req.query.q));
    res.json({ success: true, data: results });
  } catch (err) { next(err); }
};
