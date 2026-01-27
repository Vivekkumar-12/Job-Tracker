import express from 'express';
import verifyToken from '../middleware/auth.js';
import { 
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  getPushSubscription,
  getVapidKey,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications
} from '../controllers/notificationController.js';

const router = express.Router();

// Push notification endpoints
router.post('/subscribe', verifyToken, subscribeToPushNotifications);
router.post('/unsubscribe', verifyToken, unsubscribeFromPushNotifications);
router.get('/subscription', verifyToken, getPushSubscription);
router.get('/vapid-public-key', getVapidKey);

// Notification management endpoints
router.get('/', verifyToken, getNotifications);
router.patch('/:notificationId/read', verifyToken, markNotificationAsRead);
router.patch('/mark-all-read', verifyToken, markAllNotificationsAsRead);
router.delete('/:notificationId', verifyToken, deleteNotification);
router.delete('/', verifyToken, deleteAllNotifications);

export default router;
