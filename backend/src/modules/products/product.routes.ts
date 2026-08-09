import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import * as ctrl from './product.controller';

const router = Router();
router.use(authenticate);

router.get('/search', ctrl.search);
router.get('/categories', ctrl.getCategories);
router.get('/health', ctrl.getHealthSummary);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', authorize('ADMIN', 'WAREHOUSE'), ctrl.create);
router.put('/:id', authorize('ADMIN', 'WAREHOUSE'), ctrl.update);
router.delete('/:id', authorize('ADMIN'), ctrl.remove);

export default router;
