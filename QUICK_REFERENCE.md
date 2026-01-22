# Push Notifications - Quick Reference Guide

## For Developers Integrating This Feature

### 📦 Importing Notification Functions

```javascript
// In any component
import { 
  sendReminderNotification,
  scheduleReminderNotification,
  showNotification,
  areNotificationsEnabled
} from '@/lib/notificationUtils';
```

### 🎯 Common Use Cases

#### 1. Send Immediate Notification
```javascript
const reminder = {
  _id: 'reminder-id',
  applicationTitle: 'Software Engineer',
  companyName: 'Tech Corp',
  description: 'Interview Tomorrow',
  applicationId: 'app-id'
};

await sendReminderNotification(reminder);
```

#### 2. Schedule Notification for Later
```javascript
const reminder = {
  // ... reminder data ...
  reminderDate: new Date('2024-12-20T14:00:00')
};

// Automatically calculates delay and schedules
await scheduleReminderNotification(reminder);
```

#### 3. Check if Notifications Enabled
```javascript
if (areNotificationsEnabled()) {
  // Show notification
  await sendReminderNotification(reminder);
} else {
  // Show toast to enable notifications
  toast({
    title: "Enable Notifications",
    description: "Push notifications are disabled"
  });
}
```

#### 4. Show Custom Notification
```javascript
await showNotification('Interview Reminder', {
  body: 'Your interview with Tech Corp is in 1 hour',
  tag: 'interview-reminder',
  requireInteraction: true,
  data: { 
    applicationId: 'app-id',
    url: '/applications/app-id'
  }
});
```

### 🔧 API Client Methods

```javascript
import { apiClient } from '@/lib/apiClient';

// Subscribe to push notifications
await apiClient.notifications.subscribe(subscription);

// Unsubscribe from push notifications
await apiClient.notifications.unsubscribe();

// Get subscription status
const status = await apiClient.notifications.getSubscription();
```

### 🛠️ Testing in Browser Console

```javascript
// Test immediate notification
import { sendReminderNotification } from '/src/lib/notificationUtils.js';
sendReminderNotification({
  _id: 'test-1',
  applicationTitle: 'Test Job',
  companyName: 'Test Co',
  description: 'Test reminder',
  applicationId: 'test-app'
});

// Test scheduled notification (5 seconds)
import { scheduleReminderNotification } from '/src/lib/notificationUtils.js';
scheduleReminderNotification({
  _id: 'test-2',
  applicationTitle: 'Test Job 2',
  companyName: 'Test Co 2',
  description: 'Scheduled test',
  applicationId: 'test-app-2',
  reminderDate: new Date(Date.now() + 5000)
});
```

### 📱 Notification Data Structure

```javascript
// Minimal required fields
{
  _id: String,                        // Unique reminder ID
  applicationTitle: String,           // Title shown in notification
  applicationId: String,              // App ID for navigation
  // Optional fields (gracefully handled)
  companyName?: String,               // Company name in notification
  description?: String,               // Additional details
  reminderDate?: Date | String        // For scheduled notifications
}
```

### ⚙️ Settings Integration Example

```javascript
// In Settings or any page that needs notification control

import { 
  requestNotificationPermission,
  areNotificationsEnabled,
  subscribeToPush,
  unsubscribeFromPush 
} from '@/lib/notificationUtils';
import { useToast } from '@/hooks/use-toast';

const MyComponent = () => {
  const [pushEnabled, setPushEnabled] = useState(false);
  const { toast } = useToast();

  const handlePushToggle = async (enabled) => {
    if (!enabled) {
      // Disable
      await unsubscribeFromPush();
      setPushEnabled(false);
      toast({ title: 'Push notifications disabled' });
      return;
    }

    // Enable
    try {
      const permission = await requestNotificationPermission();
      if (permission === 'granted') {
        await subscribeToPush();
        setPushEnabled(true);
        toast({ title: 'Push notifications enabled!' });
      } else {
        toast({ 
          title: 'Permission denied',
          description: 'Enable in browser settings',
          variant: 'destructive'
        });
      }
    } catch (err) {
      toast({ 
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      });
    }
  };

  return (
    <Switch 
      checked={pushEnabled}
      onCheckedChange={handlePushToggle}
    />
  );
};
```

### 🗓️ Integration with Reminders

```javascript
// In Reminders.jsx or ReminderForm.jsx

import { scheduleReminderNotification } from '@/lib/notificationUtils';

const handleCreateReminder = async (formData) => {
  // Create reminder via API
  const reminder = await apiClient.reminders.create(formData);
  
  // Schedule notification if enabled
  try {
    await scheduleReminderNotification(reminder);
  } catch (err) {
    // Notification failed, but reminder was created
    console.warn('Notification scheduling failed:', err);
  }
};
```

### 🔄 Reminder Update Example

```javascript
// When reminder is updated
const handleUpdateReminder = async (id, updatedData) => {
  const reminder = await apiClient.reminders.update(id, updatedData);
  
  // Cancel old notification (if exists)
  await cancelNotification(`reminder-${id}`);
  
  // Schedule new notification with updated time
  await scheduleReminderNotification(reminder);
};
```

### 🗑️ Cleanup Example

```javascript
// When deleting a reminder
const handleDeleteReminder = async (id) => {
  await apiClient.reminders.delete(id);
  
  // Clean up notification
  await cancelNotification(`reminder-${id}`);
};
```

### ❌ Error Handling

```javascript
import { toast } from '@/hooks/use-toast';

try {
  await sendReminderNotification(reminder);
} catch (err) {
  console.error('Notification error:', err);
  
  if (err.message.includes('not supported')) {
    toast({
      title: 'Browser Not Supported',
      description: 'Your browser does not support notifications',
      variant: 'destructive'
    });
  } else if (err.message.includes('permission')) {
    toast({
      title: 'Permission Denied',
      description: 'Enable notifications in browser settings',
      variant: 'destructive'
    });
  } else {
    toast({
      title: 'Error',
      description: 'Failed to send notification',
      variant: 'destructive'
    });
  }
}
```

### 🧩 Component Integration Pattern

```javascript
import { useState, useEffect } from 'react';
import { sendReminderNotification, areNotificationsEnabled } from '@/lib/notificationUtils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export const ReminderCard = ({ reminder }) => {
  const { toast } = useToast();
  const [isNotifying, setIsNotifying] = useState(false);

  const handleSendNotification = async () => {
    if (!areNotificationsEnabled()) {
      toast({ 
        title: 'Notifications not enabled',
        description: 'Enable in settings first'
      });
      return;
    }

    setIsNotifying(true);
    try {
      await sendReminderNotification(reminder);
      toast({ title: 'Notification sent!' });
    } catch (err) {
      toast({ 
        title: 'Failed to send notification',
        variant: 'destructive'
      });
    } finally {
      setIsNotifying(false);
    }
  };

  return (
    <div className="reminder-card">
      <h3>{reminder.applicationTitle}</h3>
      <p>{reminder.companyName}</p>
      <Button 
        onClick={handleSendNotification}
        disabled={isNotifying}
      >
        {isNotifying ? 'Sending...' : 'Test Notification'}
      </Button>
    </div>
  );
};
```

### 📊 Database Fields Reference

```javascript
// In User model
pushNotification: {
  enabled: Boolean,           // Whether user opted in
  subscription: {
    endpoint: String,         // Push service endpoint
    keys: {
      p256dh: String,        // Encryption key
      auth: String           // Authentication key
    }
  },
  subscribedAt: Date,         // When user enabled
  unsubscribedAt: Date        // When user disabled
}
```

### 🎨 UI Components

```javascript
// Permission Status Indicator
{pushPermissionStatus === "granted" && (
  <p className="text-xs text-green-600 mt-1">✓ Enabled</p>
)}
{pushPermissionStatus === "denied" && (
  <p className="text-xs text-orange-600 mt-1">⊘ Blocked in browser settings</p>
)}

// Toggle with Loading
<Switch
  checked={pushNotifications}
  onCheckedChange={handlePushNotificationToggle}
  disabled={isPushRequestingPermission}
/>
```

### 🔍 Debugging Tips

```javascript
// Check Service Worker status
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service Workers:', regs);
});

// Check notification permission
console.log('Permission:', Notification.permission);

// Get current subscription
apiClient.notifications.getSubscription().then(status => {
  console.log('Subscription:', status);
});

// Test all utilities
import * as notifs from '@/lib/notificationUtils.js';
console.log('Available functions:', Object.keys(notifs));
```

### 📋 Checklist for Integration

- [ ] Import notification utilities in your component
- [ ] Check `areNotificationsEnabled()` before showing notifications
- [ ] Handle errors with try-catch blocks
- [ ] Show user feedback with toast messages
- [ ] Use proper reminder data structure
- [ ] Test with console examples first
- [ ] Verify Settings toggle works
- [ ] Monitor browser console for errors
- [ ] Test on multiple browsers

---

**Quick Links**
- Full docs: [PUSH_NOTIFICATIONS_DOCS.md](PUSH_NOTIFICATIONS_DOCS.md)
- Testing guide: [PUSH_NOTIFICATIONS_TESTING.md](PUSH_NOTIFICATIONS_TESTING.md)
- Implementation summary: [PUSH_NOTIFICATIONS_SUMMARY.md](PUSH_NOTIFICATIONS_SUMMARY.md)
