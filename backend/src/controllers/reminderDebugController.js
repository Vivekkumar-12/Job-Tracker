import Reminder from '../models/Reminder.js';

/**
 * Debug endpoint to check reminder timing
 */
export const debugReminder = async (req, res) => {
  try {
    const { reminderId } = req.params;
    const reminder = await Reminder.findById(reminderId).populate('userId');
    
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    const now = new Date();
    const notifyBefore = reminder.emailNotifyBefore || 60;
    const notifyTime = new Date(reminder.reminderDate.getTime() - notifyBefore * 60 * 1000);
    const reminderTime = new Date(reminder.reminderDate);
    
    const minutesToNotifyTime = (notifyTime.getTime() - now.getTime()) / (1000 * 60);
    const minutesToReminderTime = (reminderTime.getTime() - now.getTime()) / (1000 * 60);
    
    return res.json({
      reminder: {
        id: reminder._id,
        title: reminder.title,
        emailNotifyBefore: notifyBefore,
        emailSent: reminder.emailSent,
        isCompleted: reminder.isCompleted
      },
      times: {
        now: now.toISOString(),
        reminderTime: reminderTime.toISOString(),
        notifyTime: notifyTime.toISOString(),
        minutesToNotifyTime: minutesToNotifyTime.toFixed(1),
        minutesToReminderTime: minutesToReminderTime.toFixed(1),
        shouldSendNow: now >= notifyTime && !reminder.emailSent
      },
      explanation: `Email should be sent ${notifyBefore} minutes BEFORE reminder time. Currently ${minutesToReminderTime.toFixed(1)} minutes until reminder.`
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
