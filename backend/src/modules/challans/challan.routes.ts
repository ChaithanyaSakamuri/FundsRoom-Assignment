import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import * as ctrl from './challan.controller';

const router = Router();
router.use(authenticate);

router.get('/search', ctrl.search);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.get('/:id/pdf', ctrl.downloadPDF);
router.post('/', authorize('ADMIN', 'SALES'), ctrl.create);
router.post('/:id/confirm', authorize('ADMIN', 'SALES'), ctrl.confirm);
router.post('/:id/cancel', authorize('ADMIN', 'SALES'), ctrl.cancel);

export default router;
