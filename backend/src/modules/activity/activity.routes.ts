import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { getActivity } from './activity.controller';

const router = Router();
router.use(authenticate);
router.get('/', getActivity);

export default router;
