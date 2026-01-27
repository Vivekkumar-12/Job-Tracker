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
      setNotifications(data.notifications || []);
      setPagination(data.pagination || {});
      setUnreadCount(data.pagination?.unreadCount || 0);
      console.log('✅ Notifications loaded:', data.notifications?.length || 0);
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
      await markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId
            ? { ...notif, read: true, readAt: new Date().toISOString() }
            : notif
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      setError(err.message);
      console.error('Error marking notification as read:', err);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsAsRead();
      
      // Update local state
      setNotifications(prev =>
        prev.map(notif => ({
          ...notif,
          read: true,
          readAt: new Date().toISOString()
        }))
      );
      
      // Reset unread count
      setUnreadCount(0);
    } catch (err) {
      setError(err.message);
      console.error('Error marking all notifications as read:', err);
    }
  }, []);

  // Delete single notification
  const deleteOne = useCallback(async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      
      // Update local state
      setNotifications(prev =>
        prev.filter(notif => notif._id !== notificationId)
      );
      
      // Update counts
      const deletedNotif = notifications.find(n => n._id === notificationId);
      if (deletedNotif && !deletedNotif.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      setPagination(prev => ({
        ...prev,
        total: Math.max(0, prev.total - 1)
      }));
    } catch (err) {
      setError(err.message);
      console.error('Error deleting notification:', err);
    }
  }, [notifications]);

  // Delete all notifications
  const deleteAll = useCallback(async () => {
    try {
      await deleteAllNotifications();
      
      // Clear local state
      setNotifications([]);
      setUnreadCount(0);
      setPagination({ total: 0, limit: 50, skip: 0 });
    } catch (err) {
      setError(err.message);
      console.error('Error deleting all notifications:', err);
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
