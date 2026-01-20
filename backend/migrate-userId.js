import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const migrateUserId = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/job-hunt-hub');
    console.log('Connected to MongoDB');

    // Get the database
    const db = mongoose.connection.db;

    // Get all users
    const users = await db.collection('users').find({}).toArray();
    console.log(`Found ${users.length} users`);

    if (users.length === 0) {
      console.log('No users found. Please create a user first.');
      process.exit(0);
    }

    // Use the first user's ID for migration (or you can specify which user)
    const primaryUserId = users[0]._id;
    console.log(`Using primary user ID: ${primaryUserId}`);

    // Update all applications without userId
    const appResult = await db.collection('applications').updateMany(
      { userId: { $exists: false } },
      { $set: { userId: primaryUserId } }
    );
    console.log(`Updated ${appResult.modifiedCount} applications with userId`);

    // Update all reminders without userId
    const reminderResult = await db.collection('reminders').updateMany(
      { userId: { $exists: false } },
      { $set: { userId: primaryUserId } }
    );
    console.log(`Updated ${reminderResult.modifiedCount} reminders with userId`);

    // Verify the updates
    const appCount = await db.collection('applications').countDocuments({ userId: primaryUserId });
    const reminderCount = await db.collection('reminders').countDocuments({ userId: primaryUserId });

    console.log(`\nMigration complete!`);
    console.log(`Total applications for user: ${appCount}`);
    console.log(`Total reminders for user: ${reminderCount}`);

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
};

migrateUserId();
