// Push Notification utility functions
import { apiClient } from './apiClient.js';

/**
 * Register service worker and set up push notifications
 */
export const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Workers are not supported in this browser');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/'
    });
    console.log('Service Worker registered successfully:', registration);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    throw error;
  }
};

/**
 * Request notification permission from user
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    throw new Error('Notifications are not supported in this browser');
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      throw error;
    }
  }

  return Notification.permission;
};

/**
 * Check if notifications are enabled
 */
export const areNotificationsEnabled = () => {
  if (!('Notification' in window)) {
    return false;
  }
  return Notification.permission === 'granted';
};

/**
 * Subscribe to push notifications via service worker
 */
export const subscribeToPush = async () => {
  try {
    // Ensure service worker is registered
    const registration = await registerServiceWorker();
    if (!registration) {
      throw new Error('Service Worker is not available');
    }

    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      // Create new subscription (note: requires VAPID public key in production)
      // For now, this is just for local notifications
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        // In production, you would add:
        // applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      }).catch(err => {
        console.log('Push subscription not available (expected in dev):', err);
        return null;
      });
    }

    if (subscription) {
      // Send subscription to backend
      await apiClient.notifications.subscribe(subscription);
    }

    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push:', error);
    return null;
  }
};

/**
 * Unsubscribe from push notifications
 */
export const unsubscribeFromPush = async () => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      // Notify backend
      await apiClient.notifications.unsubscribe();
    }
    
    return true;
  } catch (error) {
    console.error('Failed to unsubscribe from push:', error);
    return false;
  }
};

/**
 * Show a local notification (immediate)
 */
export const showNotification = async (title, options = {}) => {
  if (!areNotificationsEnabled()) {
    console.warn('Notifications are not enabled');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    const defaultOptions = {
      icon: '/icon-2.png',
      badge: '/icon-2.png',
      tag: 'notification',
      requireInteraction: false,
      ...options
    };

    return registration.showNotification(title, defaultOptions);
  } catch (error) {
    console.error('Failed to show notification:', error);
    return null;
  }
};

/**
 * Send push notification for a reminder
 */
export const sendReminderNotification = async (reminder) => {
  const title = `Reminder: ${reminder.applicationTitle || reminder.title || 'Job Application'}`;
  
  let body = '';
  if (reminder.companyName) {
    body += `${reminder.companyName}`;
  }
  if (reminder.description) {
    body += body ? ` - ${reminder.description}` : reminder.description;
  }
  if (!body) {
    body = reminder.company || 'You have an upcoming reminder';
  }

  const options = {
    body,
    tag: `reminder-${reminder._id}`,
    requireInteraction: true,
    data: {
      reminderId: reminder._id,
      applicationId: reminder.applicationId,
      type: 'reminder',
      company: reminder.companyName || reminder.company,
      priority: reminder.priority,
      url: `/applications/${reminder.applicationId}`
    }
  };

  return showNotification(title, options);
};

/**
 * Schedule a notification for a specific time
 */
export const scheduleNotification = (title, options, delayMs) => {
  return new Promise((resolve) => {
    setTimeout(async () => {
      const result = await showNotification(title, options);
      resolve(result);
    }, delayMs);
  });
};

/**
 * Schedule a notification for a reminder at a specific time
 */
export const scheduleReminderNotification = async (reminder) => {
  const reminderTime = new Date(reminder.reminderDate).getTime();
  const nowTime = Date.now();
  const delayMs = reminderTime - nowTime;

  if (delayMs <= 0) {
    // Reminder time has passed, show immediately
    return sendReminderNotification(reminder);
  }

  // Schedule for the future
  return scheduleNotification(
    `Reminder: ${reminder.applicationTitle || reminder.title || 'Job Application'}`,
    {
      body: `${reminder.companyName || reminder.company || ''} - ${reminder.description || ''}`.trim() || 'Upcoming reminder',
      tag: `reminder-${reminder._id}`,
      requireInteraction: true,
      data: {
        reminderId: reminder._id,
        applicationId: reminder.applicationId,
        type: 'reminder',
        url: `/applications/${reminder.applicationId}`
      }
    },
    delayMs
  );
};

/**
 * Cancel all notifications with a specific tag
 */
export const cancelNotification = async (tag) => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const notifications = await registration.getNotifications({ tag });
    notifications.forEach(notification => notification.close());
    return true;
  } catch (error) {
    console.error('Failed to cancel notification:', error);
    return false;
  }
};

/**
 * Set up message listener for service worker communication
 */
export const setupServiceWorkerMessageListener = (callback) => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'NOTIFICATION_CLICKED') {
        callback(event.data.data);
      }
    });
  }
};

export default {
  registerServiceWorker,
  requestNotificationPermission,
  areNotificationsEnabled,
  subscribeToPush,
  unsubscribeFromPush,
  showNotification,
  sendReminderNotification,
  scheduleNotification,
  scheduleReminderNotification,
  cancelNotification,
  setupServiceWorkerMessageListener
};
