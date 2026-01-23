import express from 'express';
import {
  getReminders,
  getReminder,
  createReminder,
  updateReminder,
  deleteReminder,
  completeReminder
} from '../controllers/reminderController.js';
import { debugReminder } from '../controllers/reminderDebugController.js';

const router = express.Router();

router.get('/', getReminders);
router.get('/debug/:reminderId', debugReminder);
router.get('/:id', getReminder);
router.post('/', createReminder);
router.put('/:id', updateReminder);
router.delete('/:id', deleteReminder);
router.patch('/:id/complete', completeReminder);

export default router;
