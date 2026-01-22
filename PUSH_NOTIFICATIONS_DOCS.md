## Push Notifications Implementation

This document outlines the push notifications feature implemented in JobTracker.

### Overview

Push notifications allow users to receive device notifications for job application reminders. The system uses:
- **Service Workers** for background notification handling
- **Web Notifications API** for displaying notifications
- **Backend storage** for subscription management
- **Scheduled notifications** for reminder timing

### Architecture

#### Frontend Components

1. **`notificationUtils.js`** - Core notification utilities
   - `registerServiceWorker()` - Registers the service worker
   - `requestNotificationPermission()` - Requests browser permission
   - `subscribeToPush()` - Subscribes user to push notifications
   - `unsubscribeFromPush()` - Unsubscribes user
   - `showNotification()` - Shows immediate notifications
   - `sendReminderNotification()` - Shows reminder-specific notifications
   - `scheduleNotification()` - Schedules notifications for future times
   - `scheduleReminderNotification()` - Schedules reminder notifications
   - `cancelNotification()` - Cancels a notification by tag
   - `setupServiceWorkerMessageListener()` - Handles SW communication

2. **`service-worker.js`** (public/) - Service Worker
   - Handles 'push' events from server
   - Handles 'notificationclick' events (navigation)
   - Handles 'notificationclose' events (cleanup)
   - Communicates with app via postMessage

3. **`Settings.jsx`** - Settings UI
   - Push Notifications toggle in Privacy/Notifications tab
   - Shows permission status (Enabled/Blocked/Pending)
   - Handles enable/disable with proper permission requests
   - Loading state during permission request

4. **`App.jsx`** - Main app component
   - Sets up service worker message listener
   - Routes notification clicks to appropriate pages
   - Maintains app-level notification state

5. **`main.jsx`** - Application entry point
   - Registers service worker on app startup

#### Backend Components

1. **`notificationController.js`** - Notification business logic
   - `subscribeToPushNotifications()` - Stores subscription
   - `unsubscribeFromPushNotifications()` - Removes subscription
   - `getPushSubscription()` - Gets subscription status

2. **`routes/notifications.js`** - API endpoints
   - `POST /api/notifications/subscribe` - Subscribe to notifications
   - `POST /api/notifications/unsubscribe` - Unsubscribe
   - `GET /api/notifications/subscription` - Get subscription status

3. **`User.js` model** - Database schema
   ```javascript
   pushNotification: {
     enabled: Boolean,
     subscription: {
       endpoint: String,
       keys: { p256dh: String, auth: String }
     },
     subscribedAt: Date,
     unsubscribedAt: Date
   }
   ```

### User Flow

#### Enabling Push Notifications

1. User opens Settings → Privacy/Notifications tab
2. User toggles "Push Notifications" switch
3. System checks if notifications are supported
4. If already granted, enable immediately
5. If not granted, request permission dialog
6. On permission grant:
   - Register service worker
   - Subscribe to push notifications
   - Send subscription to backend
   - Save in database
7. Show status indicator (✓ Enabled)

#### Disabling Push Notifications

1. User toggles "Push Notifications" switch (off)
2. System calls `unsubscribeFromPush()`
3. Unsubscribe from push manager
4. Notify backend to remove subscription
5. Update user preferences
6. Show confirmation toast

#### Receiving Notifications

1. Reminder is triggered (via email or local check)
2. System sends push notification via Service Worker
3. Service Worker shows notification on device
4. User clicks notification
5. Service Worker posts message to app
6. App receives message and navigates to application details
7. Notification closes

### Integration with Reminders

The Reminders feature can trigger push notifications:

```javascript
// In Reminders component
import { sendReminderNotification, scheduleReminderNotification } from '@/lib/notificationUtils';

// Show immediate notification
await sendReminderNotification(reminder);

// Schedule for later
await scheduleReminderNotification(reminder);
```

### API Reference

#### Subscribe to Push Notifications
```
POST /api/notifications/subscribe
Authorization: Bearer {token}
Content-Type: application/json

{
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  }
}

Response: { success: true, user: {...} }
```

#### Unsubscribe from Push
```
POST /api/notifications/unsubscribe
Authorization: Bearer {token}

Response: { success: true, user: {...} }
```

#### Get Subscription Status
```
GET /api/notifications/subscription
Authorization: Bearer {token}

Response: { success: true, isSubscribed: boolean, subscription: {...} }
```

### Error Handling

The system gracefully handles:
- Unsupported browsers (no Service Worker support)
- Permission denied by user
- Service Worker registration failures
- Failed subscription API calls
- Network errors

### Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Service Workers | ✓ | ✓ | 11.1+ | ✓ |
| Notifications | ✓ | ✓ | 13+ | ✓ |
| Push API | ✓ | ✓ | ✗ | ✓ |

**Note**: Local notifications work in all modern browsers; full push requires VAPID setup (optional).

### Development vs Production

#### Development
- Local notifications (no server required)
- Service Worker served from /public
- No VAPID keys needed

#### Production
- Full push notifications
- VAPID public/private keys required
- Web Push API setup needed
- Service Worker caching strategy

### Future Enhancements

1. **Push API Integration**
   - Add VAPID key configuration
   - Send push from server
   - Support offline notifications

2. **Advanced Scheduling**
   - Persistent scheduled notifications
   - Background sync API
   - Smart notification timing

3. **Notification Preferences**
   - Customizable notification types
   - Notification frequency control
   - Do not disturb scheduling

4. **Analytics**
   - Track notification engagement
   - Monitor click-through rates
   - Device notification stats

### Testing

#### Manual Testing
1. Open Settings → Privacy/Notifications
2. Toggle "Push Notifications" on
3. Confirm browser permission prompt
4. See "✓ Enabled" status
5. Create a reminder
6. Wait for notification or test with:
   ```javascript
   // In browser console
   import { sendReminderNotification } from '/src/lib/notificationUtils.js';
   sendReminderNotification({
     _id: '123',
     applicationTitle: 'Test',
     companyName: 'Test Co',
     description: 'Test reminder'
   });
   ```

#### Automated Testing
```javascript
// Jest/Vitest example
test('should enable push notifications', async () => {
  const permission = await requestNotificationPermission();
  expect(permission).toBe('granted' | 'denied' | 'default');
});

test('should show reminder notification', async () => {
  const reminder = { ... };
  await sendReminderNotification(reminder);
  // Verify notification appears
});
```

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Service Worker not registering | Check /public/service-worker.js exists, clear browser cache |
| Permission dialog not showing | Check browser notification settings, not already granted/denied |
| Notifications not appearing | Verify Notification.permission = 'granted', SW is active |
| Notification click not navigating | Check setupServiceWorkerMessageListener is called in App.jsx |
| Settings shows "Blocked" | Enable notifications in browser settings → notifications |

### Deployment Checklist

- [ ] Service worker file in public folder
- [ ] Notification routes added to backend
- [ ] User model updated with pushNotification field
- [ ] API client has notifications methods
- [ ] Settings page has push notification toggle
- [ ] App.jsx has message listener setup
- [ ] main.jsx registers service worker
- [ ] No console errors on startup
- [ ] Test enable/disable flow
- [ ] Test notification display
- [ ] Test notification click navigation

