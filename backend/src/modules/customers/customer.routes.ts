import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import * as ctrl from './customer.controller';

const router = Router();
router.use(authenticate);

router.get('/search', ctrl.search);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', authorize('ADMIN', 'SALES'), ctrl.create);
router.put('/:id', authorize('ADMIN', 'SALES'), ctrl.update);
router.delete('/:id', authorize('ADMIN'), ctrl.remove);
router.post('/:id/followups', authorize('ADMIN', 'SALES'), ctrl.createFollowup);
router.put('/:id/followups/:fid', authorize('ADMIN', 'SALES'), ctrl.updateFollowup);

export default router;
