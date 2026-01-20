import mongoose from 'mongoose';
import Application from './src/models/Application.js';
import Reminder from './src/models/Reminder.js';

async function testWeeklyActivity() {
  try {
    await mongoose.connect('mongodb://localhost:27017/job-hunt-hub');
    const userId = '6948d15c92c12cd91d49f541';
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekData = [];
    
    console.log('Today:', today.toISOString());
    console.log('Today Day of week:', days[today.getDay()]);
    
    // Calculate the start of the current week (Sunday)
    const startOfWeek = new Date(today);
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);
    
    console.log('Start of week (Sunday):', startOfWeek.toISOString());
    console.log('\n--- Weekly Activity Calculation (Current Week: Sun-Sat) ---');
    
    // Generate data for each day of the week
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const applicationCount = await Application.countDocuments({
        userId,
        appliedDate: {
          $gte: date,
          $lt: nextDate
        }
      });
      
      const interviewCount = await Reminder.countDocuments({
        userId,
        reminderDate: {
          $gte: date,
          $lt: nextDate
        },
        type: 'interview'
      });
      
      console.log(`${days[date.getDay()]} (${date.toISOString().split('T')[0]}): Applied=${applicationCount}, Interviews=${interviewCount}`);
      
      weekData.push({
        day: days[date.getDay()],
        applied: applicationCount,
        interviews: interviewCount
      });
    }
    
    console.log('\n--- Week Data Output ---');
    console.log(JSON.stringify(weekData, null, 2));
    
    console.log('\n--- Summary ---');
    const totalApplied = weekData.reduce((sum, d) => sum + d.applied, 0);
    const totalInterviews = weekData.reduce((sum, d) => sum + d.interviews, 0);
    console.log(`Total Applications this week: ${totalApplied}`);
    console.log(`Total Interviews scheduled: ${totalInterviews}`);
    
    process.exit(0);
  } catch(e) {
    console.error(e.message);
    process.exit(1);
  }
}
testWeeklyActivity();
