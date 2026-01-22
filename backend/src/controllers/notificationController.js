import User from '../models/User.js';

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
