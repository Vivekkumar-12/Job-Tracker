import React, { useEffect, useState } from 'react';
import { useNotifications } from '../hooks/useNotifications.js';
import { Trash2, Check, CheckAll, Bell, RefreshCw } from 'lucide-react';
import './NotificationPanel.css';

export const NotificationPanel = () => {
  const {
    notifications,
    unreadCount,
    loading,
    pagination,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteOne,
    deleteAll
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  // Load notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      console.log('🔄 Loading notifications for filter:', activeFilter);
      loadNotifications(activeFilter === 'unread', 50, 0);
    }
  }, [isOpen, activeFilter, loadNotifications]);

  const displayNotifications = activeFilter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  const handleMarkAsRead = (e, notificationId) => {
    e.stopPropagation();
    console.log('✓ Marking notification as read:', notificationId);
    markAsRead(notificationId);
  };

  const handleDelete = (e, notificationId) => {
    e.stopPropagation();
    if (confirm('Delete this notification permanently?')) {
      console.log('🗑 Deleting notification:', notificationId);
      deleteOne(notificationId);
    }
  };

  const handleMarkAllAsRead = () => {
    if (confirm('Mark all notifications as read?')) {
      console.log('✓ Marking all as read');
      markAllAsRead();
    }
  };

  const handleDeleteAll = () => {
    if (confirm('Delete all notifications permanently? This action cannot be undone.')) {
      deleteAll();
    }
  };

  return (
    <div className="notification-panel-wrapper">
      <button
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        title={`${unreadCount} unread notifications`}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="close-btn"
            >
              ✕
            </button>
          </div>

          <div className="notification-filters">
            <button
              className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All ({pagination.total})
            </button>
            <button
              className={`filter-btn ${activeFilter === 'unread' ? 'active' : ''}`}
              onClick={() => setActiveFilter('unread')}
            >
              Unread ({unreadCount})
            </button>
            <button
              className="filter-btn refresh-btn"
              onClick={() => loadNotifications(activeFilter === 'unread', 50, 0)}
              disabled={loading}
              title="Refresh notifications"
            >
              <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          </div>

          {loading && <div className="notification-loading">Loading notifications...</div>}
            <div className="notification-empty">
              <Bell size={40} />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="notification-list">
              {displayNotifications.map(notification => (
                <div
                  key={notification._id}
                  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                >
                  <div className="notification-content">
                    <h4 className="notification-title">{notification.title}</h4>
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="notification-actions">
                    {!notification.read && (
                      <button
                        className="action-btn mark-read"
                        onClick={(e) => handleMarkAsRead(e, notification._id)}
                        title="Mark as read"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button
                      className="action-btn delete"
                      onClick={(e) => handleDelete(e, notification._id)}
                      title="Delete permanently"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {displayNotifications.length > 0 && (
            <div className="notification-footer">
              <button
                className="action-link"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
              >
                <CheckAll size={16} /> Mark all as read
              </button>
              <button
                className="action-link danger"
                onClick={handleDeleteAll}
              >
                <Trash2 size={16} /> Delete all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
