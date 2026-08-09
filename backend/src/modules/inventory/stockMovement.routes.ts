import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { getAll, create } from './stockMovement.controller';

const router = Router();
router.use(authenticate);

router.get('/', getAll);
router.post('/', authorize('ADMIN', 'WAREHOUSE'), create);

export default router;
