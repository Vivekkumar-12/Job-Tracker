import express from 'express';
import verifyToken from '../middleware/auth.js';
import { 
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  getPushSubscription 
} from '../controllers/notificationController.js';

const router = express.Router();

// Subscribe to push notifications
router.post('/subscribe', verifyToken, subscribeToPushNotifications);

// Unsubscribe from push notifications
router.post('/unsubscribe', verifyToken, unsubscribeFromPushNotifications);

// Get current subscription status
router.get('/subscription', verifyToken, getPushSubscription);

export default router;
