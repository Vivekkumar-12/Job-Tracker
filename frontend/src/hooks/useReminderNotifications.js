import { useEffect } from 'react';
import { showNotification } from '@/lib/notificationUtils';

/**
 * Hook to check for due reminders and show notifications
 * This works when the app is OPEN in the browser
 */
export const useReminderNotifications = (reminders) => {
  useEffect(() => {
    if (!reminders || reminders.length === 0) return;

    const checkReminders = () => {
      const now = new Date();
      
      reminders.forEach(reminder => {
        if (reminder.isCompleted || reminder.notified) return;
        
        const notifyBefore = reminder.emailNotifyBefore || 60; // minutes
        const reminderDate = new Date(reminder.reminderDate);
        const notifyTime = new Date(reminderDate.getTime() - notifyBefore * 60 * 1000);
        
        // Check if we should notify now
        if (now >= notifyTime && now < reminderDate) {
          // Show browser notification
          showNotification(`Reminder: ${reminder.title}`, {
            body: reminder.description || `${reminder.company || 'Your task'} - ${reminderDate.toLocaleString()}`,
            tag: `reminder-${reminder._id}`,
            requireInteraction: true,
            data: {
              reminderId: reminder._id,
              url: '/reminders'
            }
          });
          
          // Mark as notified in local state (to prevent repeat notifications)
          reminder.notified = true;
        }
      });
    };

    // Check immediately
    checkReminders();

    // Check every 30 seconds
    const interval = setInterval(checkReminders, 30000);

    return () => clearInterval(interval);
  }, [reminders]);
};
