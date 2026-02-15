import { Router } from 'express';
import { setupBusiness, getBusinessInfo, updateBusinessSettings } from './business.controller';
import { authenticate } from '../../middleware/auth.middleware'; // Assuming this exists

const router = Router();

router.use(authenticate as any);

router.post('/setup', setupBusiness as any);
router.get('/info', getBusinessInfo as any);
router.patch('/settings', updateBusinessSettings as any);

export default router;
