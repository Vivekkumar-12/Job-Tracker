# Automatic Reminder Completion Feature

## Overview
The reminder system now automatically manages the lifecycle of reminders:
1. **Scheduled Email Notifications**: Sends email reminders based on `emailNotifyBefore` setting (default: 60 minutes before the reminder time)
2. **Auto-Completion**: Automatically marks reminders as completed after the reminder time has passed AND the email has been sent

## How It Works

### Email Notification Flow
1. Scheduler runs every minute
2. Finds reminders where:
   - `isCompleted: false`
   - `emailSent: false`
   - Current time >= (reminderDate - emailNotifyBefore)
3. Sends email to user (respecting notification preferences)
4. Updates `emailSent: true`

### Auto-Completion Flow
1. Scheduler runs every minute
2. Finds reminders where:
   - `isCompleted: false`
   - `emailSent: true`
   - `reminderDate < current time` (time has passed)
3. Updates `isCompleted: true`

## Database Schema

### Reminder Model Fields
```javascript
{
  reminderDate: Date,           // When the reminder is due
  emailNotifyBefore: Number,    // Minutes before to send email (default: 60)
  emailSent: Boolean,           // Whether email was sent (default: false)
  isCompleted: Boolean,         // Whether reminder is completed (default: false)
  // ... other fields
}
```

## Architecture

### Components

#### 1. Reminder Scheduler Service
**File**: `backend/src/services/reminderScheduler.js`

**Functions**:
- `processReminders()`: Main processing function that:
  - Sends due email notifications
  - Auto-completes reminders that have passed
  
- `startReminderScheduler()`: Initializes the scheduler
  - Runs immediately on startup
  - Then every 60 seconds

**Example Output**:
```
🔔 Reminder scheduler started - checking every minute
✓ Sent reminder email for: Interview with ABC Corp to user@example.com
✓ Auto-completed reminder: Follow-up call with XYZ Inc
📧 Reminder scheduler: Sent 1 emails, Auto-completed 1 reminders
```

#### 2. Server Integration
**File**: `backend/src/server.js`

```javascript
import { startReminderScheduler } from './services/reminderScheduler.js';

// In startServer():
await connectDB();
await listenWithRetry(basePort);
startReminderScheduler(); // ← Starts the scheduler
```

#### 3. Controller Updates
**File**: `backend/src/controllers/reminderController.js`

- `createReminder()`: Simplified - no longer sends immediate emails
- Emails are now sent by the scheduler based on `emailNotifyBefore`

## User Experience

### Before (Manual Flow)
1. User creates a reminder for "Interview" at 2:00 PM
2. User receives email at 1:00 PM (60 min before)
3. User manually marks reminder as complete after interview ❌

### After (Automatic Flow)
1. User creates a reminder for "Interview" at 2:00 PM
2. **Automatically** receives email at 1:00 PM ✅
3. **Automatically** marked as complete at 2:00 PM ✅

## Configuration

### Email Notification Timing
Default: 60 minutes before reminder time

Can be customized per reminder:
```javascript
{
  title: "Interview with ABC Corp",
  reminderDate: "2024-01-15T14:00:00Z",
  emailNotifyBefore: 30  // ← Send email 30 minutes before
}
```

### Scheduler Frequency
Currently runs every 60 seconds (1 minute)

To change frequency, modify in `reminderScheduler.js`:
```javascript
setInterval(() => {
  processReminders();
}, 60 * 1000); // ← Change this value (in milliseconds)
```

## Notification Preferences

Respects user's notification settings:
- `notificationPreferences.email`: Enable/disable email notifications
- `notificationPreferences.interview`: Allow interview reminders
- `notificationPreferences.deadline`: Allow deadline reminders

## Testing

### Manual Testing Steps

1. **Create a reminder 2 minutes in the future**:
```javascript
POST /api/reminders
{
  "title": "Test Reminder",
  "reminderDate": "2024-01-15T10:02:00Z", // 2 min from now
  "emailNotifyBefore": 1, // 1 minute before
  "type": "interview"
}
```

2. **Check console logs**:
```
🔔 Reminder scheduler started - checking every minute
✓ Sent reminder email for: Test Reminder to user@example.com
📧 Reminder scheduler: Sent 1 emails, Auto-completed 0 reminders
```

3. **Wait 1 minute after reminder time**:
```
✓ Auto-completed reminder: Test Reminder
📧 Reminder scheduler: Sent 0 emails, Auto-completed 1 reminders
```

4. **Verify in database**:
```javascript
// After email sent (before completion)
{
  emailSent: true,
  isCompleted: false
}

// After reminder time passed
{
  emailSent: true,
  isCompleted: true
}
```

## Error Handling

### Email Sending Failures
- Logs error but continues processing other reminders
- Does NOT mark `emailSent: true` if email fails
- Will retry on next scheduler run

### Database Errors
- Logs error with reminder ID
- Continues processing remaining reminders
- Does not crash the scheduler

## Performance Considerations

### Database Queries
- Uses indexed queries on `isCompleted`, `emailSent`, `reminderDate`
- Filters on database level (not in-memory)
- Populates `userId` and `applicationId` only when needed

### Scalability
For large reminder volumes:
1. Add database indexes:
```javascript
// In Reminder model
reminderSchema.index({ isCompleted: 1, emailSent: 1, reminderDate: 1 });
```

2. Consider batch processing:
```javascript
// Process in chunks of 100
const BATCH_SIZE = 100;
const reminders = await Reminder.find(...).limit(BATCH_SIZE);
```

## Monitoring

### Console Logs
- **Startup**: `🔔 Reminder scheduler started - checking every minute`
- **Email Sent**: `✓ Sent reminder email for: {title} to {email}`
- **Auto-Complete**: `✓ Auto-completed reminder: {title}`
- **Summary**: `📧 Reminder scheduler: Sent X emails, Auto-completed Y reminders`

### Recommended Metrics
- Number of emails sent per hour
- Number of reminders auto-completed per hour
- Email send failure rate
- Average processing time

## Future Enhancements

### Potential Features
1. **Push Notifications**: Send browser push notifications in addition to email
2. **Snooze Function**: Allow users to postpone reminders
3. **Recurring Reminders**: Auto-create next reminder after completion
4. **Timezone Support**: Handle user-specific timezones
5. **Batch Emails**: Send daily digest instead of individual emails

### Integration Points
```javascript
// Example: Add push notification
if (user.pushNotification?.enabled && user.pushNotification?.subscription) {
  await sendPushNotification(user.pushNotification.subscription, {
    title: `Reminder: ${reminder.title}`,
    body: reminder.description
  });
}
```

## Troubleshooting

### Emails Not Sending
1. Check `.env` email configuration:
   - `EMAIL_USER`
   - `EMAIL_PASSWORD`
   - `EMAIL_FROM`
   
2. Verify user's notification preferences
3. Check scheduler logs for errors

### Reminders Not Auto-Completing
1. Verify `emailSent: true` in database
2. Check if `reminderDate` has passed
3. Confirm scheduler is running (check startup logs)

### Scheduler Not Starting
1. Check server startup logs
2. Verify import path in `server.js`
3. Look for database connection issues

## API Changes

### No Breaking Changes
- Existing endpoints remain the same
- `POST /api/reminders` still works as before
- Manual completion via `PUT /api/reminders/:id/complete` still available

### New Behavior
- Creating reminders no longer sends immediate emails
- Emails sent based on `emailNotifyBefore` schedule
- Reminders auto-complete after time + email sent

## Migration Notes

### Existing Reminders
- Old reminders with `emailSent: false` will have emails sent when scheduler checks
- If reminder time has passed but email not sent, email will be sent immediately
- Then auto-completed on next check (1 minute later)

### Backward Compatibility
- All existing reminder features continue to work
- Manual completion still available
- No database migration required
