import { Request, Response, NextFunction } from 'express';
import { CustomerService } from './customer.service';
import { createCustomerSchema, updateCustomerSchema, createFollowupSchema, updateFollowupSchema } from './customer.validation';
import { AuthRequest } from '../../middleware/auth';

const service = new CustomerService();
const qp = (val: any): string => Array.isArray(val) ? val[0] : String(val || '');
const pid = (val: any): string => String(val);

export const getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await service.getAll({
      search: qp(req.query.search),
      status: qp(req.query.status),
      type: qp(req.query.type),
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
    const data = createCustomerSchema.parse(req.body);
    const customer = await service.create(data, req.user!.id);
    res.status(201).json({ success: true, data: customer });
  } catch (err) { next(err); }
};

export const update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = updateCustomerSchema.parse(req.body);
    const customer = await service.update(pid(req.params.id), data, req.user!.id);
    res.json({ success: true, data: customer });
  } catch (err) { next(err); }
};

export const remove = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await service.delete(pid(req.params.id), req.user!.id);
    res.json({ success: true, message: 'Customer deleted successfully.' });
  } catch (err) { next(err); }
};

export const createFollowup = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = createFollowupSchema.parse(req.body);
    const followup = await service.createFollowup(pid(req.params.id), data, req.user!.id);
    res.status(201).json({ success: true, data: followup });
  } catch (err) { next(err); }
};

export const updateFollowup = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = updateFollowupSchema.parse(req.body);
    const followup = await service.updateFollowup(pid(req.params.id), pid(req.params.fid), data, req.user!.id);
    res.json({ success: true, data: followup });
  } catch (err) { next(err); }
};

export const search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const results = await service.search(qp(req.query.q));
    res.json({ success: true, data: results });
  } catch (err) { next(err); }
};
