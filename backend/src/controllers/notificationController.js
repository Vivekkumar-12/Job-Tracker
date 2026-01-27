import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { getVapidPublicKey } from '../services/pushNotificationService.js';

/**
 * Subscribe user to push notifications
 * Stores the push subscription object for later use
 */
export const subscribeToPushNotifications = async (req, res) => {
  try {
    const { subscription } = req.body;
    const userId = req.user._id;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription object'
      });
    }

    // Update user with push subscription
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          'pushNotification.subscription': subscription,
          'pushNotification.enabled': true,
          'pushNotification.subscribedAt': new Date()
        }
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Successfully subscribed to push notifications',
      user
    });
  } catch (error) {
    console.error('Subscribe to push error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe to push notifications',
      error: error.message
    });
  }
};

/**
 * Unsubscribe user from push notifications
 */
export const unsubscribeFromPushNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          'pushNotification.enabled': false,
          'pushNotification.unsubscribedAt': new Date()
        },
        $unset: {
          'pushNotification.subscription': 1
        }
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Successfully unsubscribed from push notifications',
      user
    });
  } catch (error) {
    console.error('Unsubscribe from push error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe from push notifications',
      error: error.message
    });
  }
};

/**
 * Get current push notification subscription status
 */
export const getPushSubscription = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    const isSubscribed = user?.pushNotification?.enabled ?? false;

    res.json({
      success: true,
      isSubscribed,
      subscription: user?.pushNotification || null
    });
  } catch (error) {
    console.error('Get push subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get push subscription status',
      error: error.message
    });
  }
};
/**
 * Get VAPID public key for client-side subscription
 */
export const getVapidKey = async (req, res) => {
  try {
    const publicKey = getVapidPublicKey();
    
    if (!publicKey) {
      return res.status(503).json({
        success: false,
        message: 'Push notifications are not configured on this server'
      });
    }

    res.json({
      success: true,
      publicKey
    });
  } catch (error) {
    console.error('Get VAPID key error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get VAPID key',
      error: error.message
    });
  }
};

/**
 * Get all notifications for the logged-in user
 */
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { unreadOnly = false, limit = 50, skip = 0 } = req.query;

    const query = Notification.find({ userId, deletedAt: null });
    
    if (unreadOnly === 'true') {
      query.where({ read: false });
    }

    const notifications = await query
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    const total = await Notification.countDocuments({ userId, deletedAt: null });
    const unreadCount = await Notification.countDocuments({ userId, read: false, deletedAt: null });

    res.json({
      success: true,
      notifications,
      pagination: {
        total,
        unreadCount,
        limit: parseInt(limit),
        skip: parseInt(skip)
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

/**
 * Mark a single notification as read
 */
export const markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      {
        $set: {
          read: true,
          readAt: new Date()
        }
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    if (notification.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this notification'
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

/**
 * Mark all notifications as read for the user
 */
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Notification.updateMany(
      { userId, read: false, deletedAt: null },
      {
        $set: {
          read: true,
          readAt: new Date()
        }
      }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};

/**
 * Delete a notification (soft delete)
 */
export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    if (notification.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this notification'
      });
    }

    // Soft delete
    notification.deletedAt = new Date();
    await notification.save();

    res.json({
      success: true,
      message: 'Notification deleted permanently',
      notification
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};

/**
 * Delete all notifications for the user (soft delete)
 */
export const deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Notification.updateMany(
      { userId, deletedAt: null },
      {
        $set: {
          deletedAt: new Date()
        }
      }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} notifications deleted permanently`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Delete all notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete all notifications',
      error: error.message
    });
  }
};

/**
 * Create a notification (internal use)
 */
export const createNotification = async (userId, type, title, message, data = {}, actionUrl = null) => {
  try {
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      data,
      actionUrl
    });

    return await notification.save();
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
};