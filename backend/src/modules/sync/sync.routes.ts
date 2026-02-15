import { Router } from 'express';
import { syncOfflineActions } from './sync.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', syncOfflineActions);

export default router;
