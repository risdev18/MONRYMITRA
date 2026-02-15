import { Router } from 'express';
import { createReminder, getReminders, getReminderSuggestions } from './reminder.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', createReminder);
router.get('/', getReminders);
router.get('/suggestions', getReminderSuggestions);

export default router;
