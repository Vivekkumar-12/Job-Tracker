import Reminder from '../models/Reminder.js';
import User from '../models/User.js';
import { sendReminderEmail } from './emailService.js';
import { sendReminderPushNotification } from './pushNotificationService.js';
import { generateReminderEmailHTML } from './emailTemplates.js';

/**
 * Check and send reminder emails that are due
 * Automatically marks reminders as completed after sending email and time has passed
 */
export const processReminders = async () => {
  try {
    const now = new Date();
    
    // Find reminders that need email notification
    // - Not completed
    // - Email not sent yet
    // - Reminder date minus emailNotifyBefore is in the past or present
    const remindersToNotify = await Reminder.find({
      isCompleted: false,
      emailSent: false
    }).populate('userId applicationId');

    let emailsSent = 0;
    let remindersCompleted = 0;

    for (const reminder of remindersToNotify) {
      const notifyBefore = reminder.emailNotifyBefore || 60; // default 60 minutes
      const notifyTime = new Date(reminder.reminderDate.getTime() - notifyBefore * 60 * 1000);
      const reminderTime = new Date(reminder.reminderDate);
      
      // Debug logging
      const minutesUntilNotify = (notifyTime.getTime() - now.getTime()) / (1000 * 60);
      const minutesUntilReminder = (reminderTime.getTime() - now.getTime()) / (1000 * 60);
      
      // Check if it's time to send the notification
      // Only send if: NOW >= (reminderDate - notifyBefore minutes) AND email not sent yet
      if (now >= notifyTime && !reminder.emailSent) {
        try {
          const user = reminder.userId;
          
          // Check user notification preferences
          const prefs = user?.notificationPreferences || {};
          const wantsEmail = prefs.email !== false; // default true
          const typeAllowed =
            reminder.type === 'interview'
              ? prefs.interview !== false
              : reminder.type === 'deadline'
              ? prefs.deadline !== false
              : true;

          if (user?.email && wantsEmail && typeAllowed) {
            const subject = `🔔 ${reminder.title} - Job Hunt Hub Reminder`;
            
            // Generate beautiful HTML email
            const htmlBody = generateReminderEmailHTML({
              title: reminder.title,
              description: reminder.description,
              company: reminder.company,
              reminderDate: reminder.reminderDate,
              type: reminder.type,
              userName: user.username?.split(' ')[0] || 'User'
            });

            // Simple text version as fallback
            const when = new Date(reminder.reminderDate).toLocaleString();
            const bodyLines = [
              `Reminder: ${reminder.title}`,
              reminder.description ? `Description: ${reminder.description}` : null,
              reminder.company ? `Company: ${reminder.company}` : null,
              `When: ${when}`,
              reminder.type ? `Type: ${reminder.type}` : null,
            ].filter(Boolean);

            // Send email notification with beautiful HTML template
            await sendReminderEmail({
              to: user.email,
              subject,
              text: bodyLines.join('\n'),
              html: htmlBody,
            });

            // Send push notification (if enabled)
            const wantsPush = prefs.push !== false; // default true
            if (wantsPush && typeAllowed) {
              await sendReminderPushNotification(user._id, reminder).catch(err => {
                console.warn(`Failed to send push notification for ${reminder._id}:`, err.message);
              });
            }

            // Mark email as sent
            reminder.emailSent = true;
            await reminder.save();
            emailsSent++;
            
            console.log(`✓ Sent reminder email for: ${reminder.title}`);
            console.log(`  Scheduled for: ${when}`);
            console.log(`  Notify before: ${notifyBefore} minutes`);
            console.log(`  To: ${user.email}`);
            console.log(`  (${minutesUntilReminder.toFixed(1)} minutes until reminder time)`);
          }
        } catch (emailErr) {
          console.error(`Failed to send reminder email for ${reminder._id}:`, emailErr.message);
        }
      }
    }

    // Find reminders that should be auto-completed
    // - Email has been sent
    // - Reminder date has passed
    // - Not already completed
    const remindersToComplete = await Reminder.find({
      isCompleted: false,
      emailSent: true,
      reminderDate: { $lt: now }
    });

    for (const reminder of remindersToComplete) {
      try {
        reminder.isCompleted = true;
        await reminder.save();
        remindersCompleted++;
        console.log(`✓ Auto-completed reminder: ${reminder.title}`);
      } catch (err) {
        console.error(`Failed to auto-complete reminder ${reminder._id}:`, err.message);
      }
    }

    if (emailsSent > 0 || remindersCompleted > 0) {
      console.log(`📧 Reminder scheduler: Sent ${emailsSent} emails, Auto-completed ${remindersCompleted} reminders`);
    }

    return { emailsSent, remindersCompleted };
  } catch (error) {
    console.error('Error in reminder scheduler:', error.message);
    throw error;
  }
};

/**
 * Start the reminder scheduler
 * Runs every minute to check for due reminders
 */
export const startReminderScheduler = () => {
  console.log('🔔 Reminder scheduler started - checking every minute');
  
  // Run immediately on startup
  processReminders().catch(err => console.error('Initial reminder check failed:', err.message));
  
  // Then run every minute
  const intervalId = setInterval(() => {
    processReminders().catch(err => console.error('Scheduled reminder check failed:', err.message));
  }, 60 * 1000); // Every 1 minute

  return intervalId;
};
