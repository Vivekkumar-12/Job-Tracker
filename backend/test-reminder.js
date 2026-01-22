import Reminder from '../models/Reminder.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/job-hunt-hub';

async function createTestReminder() {
  try {
    // Connect to database
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find a user (you can replace this with your test user email)
    const testEmail = process.argv[2] || 'test@example.com';
    const user = await User.findOne({ email: testEmail });

    if (!user) {
      console.log(`❌ User with email "${testEmail}" not found`);
      console.log('Usage: node backend/test-reminder.js <user-email>');
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.username} (${user.email})`);
    console.log('Notification preferences:', user.notificationPreferences);

    // Create a test reminder
    const reminderDate = new Date();
    reminderDate.setHours(reminderDate.getHours() + 2); // 2 hours from now

    const reminder = new Reminder({
      userId: user._id,
      title: 'Test Interview Reminder',
      description: 'This is a test reminder to verify email notifications are working',
      reminderDate,
      type: 'interview',
      priority: 'high',
      company: 'Test Company Inc',
    });

    await reminder.save();
    console.log('✅ Test reminder created successfully');
    console.log('Reminder details:', {
      title: reminder.title,
      date: reminder.reminderDate,
      type: reminder.type,
      company: reminder.company,
    });

    // Now test sending email manually
    if (user.notificationPreferences?.email !== false && user.notificationPreferences?.interview !== false) {
      console.log('✅ User has email notifications enabled for interviews');
      console.log('📧 Email would be sent to:', user.email);
      console.log('\n⚠️  Make sure you configure SMTP settings in .env:');
      console.log('   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM');
    } else {
      console.log('❌ User has email notifications disabled');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTestReminder();
