import { Router } from 'express';
import { markAttendance, getMonthlyAttendance } from './attendance.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', markAttendance);
router.get('/', getMonthlyAttendance);

export default router;
