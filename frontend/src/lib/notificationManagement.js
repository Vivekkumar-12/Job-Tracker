// Notification management utilities
import { apiClient } from './apiClient.js';

/**
 * Fetch all notifications for the user
 */
export const fetchNotifications = async (unreadOnly = false, limit = 50, skip = 0) => {
  try {
    const response = await apiClient.get('/api/notifications', {
      params: {
        unreadOnly,
        limit,
        skip
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    throw error;
  }
};

/**
 * Mark a single notification as read
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await apiClient.patch(`/api/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await apiClient.patch('/api/notifications/mark-all-read');
    return response.data;
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
    throw error;
  }
};

/**
 * Delete a single notification permanently
 */
export const deleteNotification = async (notificationId) => {
  try {
    const response = await apiClient.delete(`/api/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete notification:', error);
    throw error;
  }
};

/**
 * Delete all notifications permanently
 */
export const deleteAllNotifications = async () => {
  try {
    const response = await apiClient.delete('/api/notifications');
    return response.data;
  } catch (error) {
    console.error('Failed to delete all notifications:', error);
    throw error;
  }
};

/**
 * Create a local notification for immediate display
 */
export const createLocalNotification = (type, title, message, data = {}, actionUrl = null) => {
  return {
    id: `local-${Date.now()}`,
    type,
    title,
    message,
    data,
    actionUrl,
    read: false,
    createdAt: new Date().toISOString(),
    isLocal: true
  };
};

/**
 * Get unread notification count
 */
export const getUnreadNotificationCount = async () => {
  try {
    const response = await apiClient.get('/api/notifications?unreadOnly=true&limit=1');
    return response.data?.pagination?.unreadCount || 0;
  } catch (error) {
    console.error('Failed to get unread notification count:', error);
    return 0;
  }
};
