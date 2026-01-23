import webpush from 'web-push';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

// Configure web-push with VAPID keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:support@jobhunthub.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
  console.log('✓ VAPID keys configured for push notifications');
} else {
  console.warn('⚠ VAPID keys not configured - push notifications will not work');
}

/**
 * Send push notification to a user
 * @param {string} userId - User ID
 * @param {object} payload - Notification payload
 */
export const sendPushNotification = async (userId, payload) => {
  try {
    const user = await User.findById(userId);
    
    if (!user || !user.pushNotification?.enabled || !user.pushNotification?.subscription) {
      console.log(`User ${userId} is not subscribed to push notifications`);
      return { success: false, reason: 'not_subscribed' };
    }

    // Check user preferences
    const prefs = user.notificationPreferences || {};
    if (prefs.push === false) {
      console.log(`User ${userId} has push notifications disabled`);
      return { success: false, reason: 'disabled_by_user' };
    }

    const subscription = user.pushNotification.subscription;
    
    // Send the push notification
    const result = await webpush.sendNotification(
      subscription,
      JSON.stringify(payload)
    );

    console.log(`✓ Push notification sent to user ${userId}`);
    return { success: true, result };
  } catch (error) {
    console.error(`Failed to send push notification to user ${userId}:`, error);
    
    // If subscription is invalid/expired, disable it
    if (error.statusCode === 410 || error.statusCode === 404) {
      await User.findByIdAndUpdate(userId, {
        $set: {
          'pushNotification.enabled': false,
          'pushNotification.unsubscribedAt': new Date()
        },
        $unset: {
          'pushNotification.subscription': 1
        }
      });
      console.log(`Disabled invalid push subscription for user ${userId}`);
    }
    
    return { success: false, error: error.message };
  }
};

/**
 * Send push notification to multiple users
 * @param {array} userIds - Array of user IDs
 * @param {object} payload - Notification payload
 */
export const sendPushNotificationToMany = async (userIds, payload) => {
  const results = await Promise.allSettled(
    userIds.map(userId => sendPushNotification(userId, payload))
  );
  
  const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
  const failed = results.length - successful;
  
  console.log(`Push notifications sent: ${successful} successful, ${failed} failed`);
  return { successful, failed, results };
};

/**
 * Send reminder push notification
 * @param {string} userId - User ID
 * @param {object} reminder - Reminder object
 */
export const sendReminderPushNotification = async (userId, reminder) => {
  const payload = {
    title: `Reminder: ${reminder.title}`,
    body: reminder.description || `Reminder for ${reminder.company || 'your task'}`,
    icon: '/icon-2.png',
    badge: '/icon-2.png',
    tag: `reminder-${reminder._id}`,
    requireInteraction: true,
    data: {
      url: '/reminders',
      reminderId: reminder._id.toString(),
      type: reminder.type || 'general'
    }
  };

  return await sendPushNotification(userId, payload);
};

/**
 * Get VAPID public key for client
 */
export const getVapidPublicKey = () => {
  return process.env.VAPID_PUBLIC_KEY || null;
};
