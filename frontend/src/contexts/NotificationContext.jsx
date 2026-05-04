import React, { createContext, useState, useCallback, useEffect } from 'react';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadNotificationCount
} from '../lib/notificationManagement.js';
import { useAuth } from './AuthContext.js';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    skip: 0
  });

  // Load notifications
  const loadNotifications = useCallback(async (unreadOnly = false, limit = 50, skip = 0) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNotifications(unreadOnly, limit, skip);
      console.log('✅ Notifications loaded from DB:', data.notifications?.length || 0, 'Total:', data.pagination?.total);
      setNotifications(data.notifications || []);
      setPagination(data.pagination || {});
      setUnreadCount(data.pagination?.unreadCount || 0);
    } catch (err) {
      setError(err.message);
      console.error('❌ Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-load notifications when user is authenticated
  useEffect(() => {
    if (user?._id) {
      console.log('📬 User authenticated, loading notifications...');
      loadNotifications();
      
      // Refresh notifications every 30 seconds
      const interval = setInterval(() => {
        loadNotifications();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [user?._id, loadNotifications]);

  // Mark single notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      console.log('✓ Marking notification as read:', notificationId);
      const result = await markNotificationAsRead(notificationId);
      console.log('✓ Mark as read response:', result);
      
      // Reload to get fresh data
      await loadNotifications();
    } catch (err) {
      setError(err.message);
      console.error('❌ Error marking notification as read:', err);
    }
  }, [loadNotifications]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      console.log('✓ Marking all as read');
      const result = await markAllNotificationsAsRead();
      console.log('✓ Mark all as read response:', result);
      
      // Reload to get fresh data
      await loadNotifications();
    } catch (err) {
      setError(err.message);
      console.error('❌ Error marking all notifications as read:', err);
    }
  }, [loadNotifications]);

  // Delete single notification
  const deleteOne = useCallback(async (notificationId) => {
    try {
      console.log('🗑 Deleting notification:', notificationId);
      const result = await deleteNotification(notificationId);
      console.log('🗑 Delete response:', result);
      
      // Reload to get fresh data
      await loadNotifications();
    } catch (err) {
      setError(err.message);
      console.error('❌ Error deleting notification:', err);
    }
  }, [loadNotifications]);

  // Delete all notifications
  const deleteAll = useCallback(async () => {
    try {
      console.log('🗑 Deleting all notifications');
      const result = await deleteAllNotifications();
      console.log('🗑 Delete all response:', result);
      
      // Clear state immediately
      setNotifications([]);
      setUnreadCount(0);
      setPagination({ total: 0, limit: 50, skip: 0 });
    } catch (err) {
      setError(err.message);
      console.error('❌ Error deleting all notifications:', err);
    }
  }, []);

  // Refresh unread count
  const refreshUnreadCount = useCallback(async () => {
    try {
      const count = await getUnreadNotificationCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Error refreshing unread count:', err);
    }
  }, []);

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    pagination,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteOne,
    deleteAll,
    refreshUnreadCount
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
