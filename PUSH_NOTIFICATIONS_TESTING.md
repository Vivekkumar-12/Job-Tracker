# Push Notifications Testing Guide

## Quick Start Testing

### 1. Enable Push Notifications (Manual)

1. Start your development server:
   ```bash
   cd backend && npm start
   cd ../frontend && npm run dev
   ```

2. Navigate to http://localhost:5173
3. Log in to your account
4. Go to Settings → Privacy/Notifications
5. Toggle "Push Notifications" ON
6. Click "Allow" on the browser permission prompt
7. Verify the status shows "✓ Enabled"

### 2. Test Immediate Notification (Console)

In browser DevTools console:

```javascript
// Import and test notification
import { sendReminderNotification } from '/src/lib/notificationUtils.js';

const testReminder = {
  _id: 'test-123',
  applicationTitle: 'Software Engineer at Tech Corp',
  companyName: 'Tech Corp',
  description: 'Technical Interview Round 2',
  applicationId: 'app-123'
};

// Show notification immediately
await sendReminderNotification(testReminder);
```

**Expected Result**: Browser notification appears in bottom right

### 3. Test Scheduled Notification (Console)

```javascript
import { scheduleReminderNotification } from '/src/lib/notificationUtils.js';

const futureReminder = {
  _id: 'scheduled-123',
  applicationTitle: 'Developer Role',
  companyName: 'StartupXYZ',
  description: 'Schedule follow-up',
  applicationId: 'app-456',
  reminderDate: new Date(Date.now() + 5000) // 5 seconds from now
};

// Schedule for 5 seconds from now
await scheduleReminderNotification(futureReminder);
console.log('Notification scheduled for 5 seconds from now...');
```

**Expected Result**: Notification appears after 5 seconds

### 4. Test Notification Click Navigation

1. In console, run immediate notification:
   ```javascript
   import { sendReminderNotification } from '/src/lib/notificationUtils.js';
   sendReminderNotification({
     _id: 'test-456',
     applicationTitle: 'QA Engineer',
     companyName: 'Tech Inc',
     description: 'HR Interview',
     applicationId: '507f1f77bcf86cd799439011' // Valid MongoDB ID
   });
   ```

2. Click the notification
3. **Expected Result**: Browser navigates to `/applications/507f1f77bcf86cd799439011`

### 5. Test Disable Push Notifications

1. In Settings → Privacy/Notifications
2. Toggle "Push Notifications" OFF
3. Verify status shows "⊘ Blocked in browser settings"
4. Try to send notification again (won't show)

## Full Integration Testing

### Test with Real Reminder Creation

1. Go to Reminders page
2. Create a new reminder:
   - Application: Select any existing application
   - Reminder Date: Set to a time 10 seconds from now
   - Description: "Test notification reminder"
   - Email Notify Before: Select any option

3. Save the reminder

4. Wait for the scheduled time
5. **Expected Result**: Notification appears with reminder details

### Test Enable/Disable Flow

```
1. Settings → Privacy/Notifications
2. Toggle Push ON → "✓ Enabled"
3. Browser shows permission prompt → Allow
4. Toggle Push OFF → returns to normal state
5. Toggle Push ON again → "✓ Enabled" (no prompt this time)
```

## Unit Testing

### Jest/Vitest Example

Create `tests/notificationUtils.test.js`:

```javascript
import { 
  registerServiceWorker,
  areNotificationsEnabled,
  sendReminderNotification,
  scheduleNotification
} from '@/lib/notificationUtils';

describe('Notification Utils', () => {
  beforeEach(() => {
    // Mock Service Worker API
    global.navigator.serviceWorker = {
      register: jest.fn().mockResolvedValue({
        showNotification: jest.fn().mockResolvedValue(undefined),
        getNotifications: jest.fn().mockResolvedValue([])
      }),
      ready: Promise.resolve({
        showNotification: jest.fn()
      })
    };
    
    // Mock Notification API
    global.Notification = {
      permission: 'granted',
      requestPermission: jest.fn()
    };
  });

  test('should register service worker', async () => {
    const registration = await registerServiceWorker();
    expect(navigator.serviceWorker.register).toHaveBeenCalledWith(
      '/service-worker.js',
      { scope: '/' }
    );
  });

  test('should check if notifications enabled', () => {
    const enabled = areNotificationsEnabled();
    expect(enabled).toBe(true);
  });

  test('should send reminder notification', async () => {
    const reminder = {
      _id: 'test-1',
      applicationTitle: 'Test Job',
      companyName: 'Test Company',
      description: 'Test Description',
      applicationId: 'app-1'
    };

    await sendReminderNotification(reminder);
    // Assertions...
  });

  test('should schedule notification', async () => {
    jest.useFakeTimers();
    
    const promise = scheduleNotification(
      'Test Title',
      { body: 'Test Body' },
      1000
    );

    jest.advanceTimersByTime(1000);
    
    await promise;
    // Assertions...
    
    jest.useRealTimers();
  });
});
```

Run tests:
```bash
npm run test -- notificationUtils.test.js
```

## Browser DevTools Testing

### Check Service Worker

1. Open DevTools → Application tab
2. Check "Service Workers" section
3. Should show `/service-worker.js` as "activated and running"

### Check Notification Permission

In console:
```javascript
console.log('Notification Permission:', Notification.permission);
// Output: "granted" or "denied" or "default"
```

### Check Subscription Status

In console:
```javascript
import { apiClient } from '@/lib/apiClient.js';

const status = await apiClient.notifications.getSubscription();
console.log('Subscription Status:', status);
// Output: { success: true, isSubscribed: true, subscription: {...} }
```

## Network Testing

Monitor API calls in DevTools → Network tab:

### Expected API Calls

1. **Subscribe Flow**
   ```
   POST /api/notifications/subscribe
   Request Body: { subscription: {...} }
   Response: { success: true, user: {...} }
   ```

2. **Unsubscribe Flow**
   ```
   POST /api/notifications/unsubscribe
   Response: { success: true, user: {...} }
   ```

3. **Get Status**
   ```
   GET /api/notifications/subscription
   Response: { success: true, isSubscribed: true/false }
   ```

## Performance Testing

### Check Service Worker Size

```javascript
// In browser console
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => {
    console.log('SW Controller:', reg.controller);
    console.log('SW Scope:', reg.scope);
  });
});
```

### Monitor Notification Memory

```javascript
// In console, check memory usage
console.memory // If available in Chrome
// Shows heap size before/after notifications
```

## Cross-Browser Testing

### Chrome/Chromium
- ✓ Full support
- Service Worker scope: /
- Notification permission: persistent
- Push API: supported (with VAPID)

### Firefox
- ✓ Full support
- Service Worker scope: /
- Notification permission: persistent
- Push API: supported (with VAPID)

### Safari
- ⚠️ Limited support
- Service Worker: 11.1+
- Notification permission: per-session
- Push API: not supported

### Edge
- ✓ Full support
- Identical to Chrome (Chromium-based)

## Error Scenarios

### Test Browser Not Supporting Notifications

```javascript
// Temporarily hide Notification API
const oldNotification = window.Notification;
delete window.Notification;

// Try to request permission
import { requestNotificationPermission } from '@/lib/notificationUtils.js';
try {
  await requestNotificationPermission();
} catch (err) {
  console.error('Expected error:', err.message);
}

// Restore
window.Notification = oldNotification;
```

### Test Service Worker Registration Failure

```javascript
// Mock SW registration failure
navigator.serviceWorker.register = 
  jest.fn().mockRejectedValue(new Error('SW registration failed'));

import { registerServiceWorker } from '@/lib/notificationUtils.js';
try {
  await registerServiceWorker();
} catch (err) {
  console.error('Expected error:', err.message);
}
```

### Test Permission Denied

```javascript
// Simulate permission denied
if ('Notification' in window) {
  // This must be done in actual browser (can't simulate in console)
  // Go to browser settings and block notifications for this site
  
  // Then check:
  console.log(Notification.permission); // 'denied'
  
  // Try to request
  import { requestNotificationPermission } from '@/lib/notificationUtils.js';
  const permission = await requestNotificationPermission();
  console.log('Result:', permission); // 'denied'
}
```

## Debugging Tips

### Enable Verbose Logging

Add to `notificationUtils.js`:

```javascript
const DEBUG = true;

const log = (message, data = null) => {
  if (DEBUG) {
    console.log(`[NOTIFICATIONS] ${message}`, data || '');
  }
};
```

### Check Service Worker Logs

In DevTools → Application → Service Workers:
1. Click service worker link
2. Check DevTools console in service worker scope
3. Look for any errors

### Monitor Notification Events

```javascript
// Listen to all notification events
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    console.log('SW Message:', event.data);
  });
}

// Listen to permission changes
document.addEventListener('visibilitychange', () => {
  if (typeof Notification !== 'undefined') {
    console.log('Permission changed:', Notification.permission);
  }
});
```

## Troubleshooting Common Issues

| Issue | Solution |
|-------|----------|
| Notification not appearing | Check Notification.permission = 'granted' |
| Service Worker not registering | Clear cache, check /public/service-worker.js |
| Click not navigating | Check App.jsx setupServiceWorkerMessageListener |
| Settings toggle not working | Check browser console for errors |
| Permission prompt not showing | Already granted/denied - check browser settings |
| API calls failing | Check Network tab, verify backend running |

---

**Useful Commands**

```bash
# Clear browser cache
# DevTools → Application → Cache Storage → Delete

# Force Service Worker update
# DevTools → Application → Service Workers → "Update on reload"

# Reset Notification permission (for testing)
# Chrome: Settings → Privacy → Notifications → Remove site
```
