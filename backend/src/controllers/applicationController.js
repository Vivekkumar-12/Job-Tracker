import Application from '../models/Application.js';
import Reminder from '../models/Reminder.js';
import mongoose from 'mongoose';

// Get all applications
export const getApplications = async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user.id }).sort({ appliedDate: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single application
export const getApplication = async (req, res) => {
  try {
    const application = await Application.findOne({ 
      _id: req.params.id,
      userId: req.user.id 
    });
    if (!application) return res.status(404).json({ error: 'Application not found' });
    res.json(application);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create application
export const createApplication = async (req, res) => {
  try {
    const application = new Application({
      ...req.body,
      userId: req.user.id
    });
    await application.save();
    res.status(201).json(application);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update application
export const updateApplication = async (req, res) => {
  try {
    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!application) return res.status(404).json({ error: 'Application not found' });
    res.json(application);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete application
export const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!application) return res.status(404).json({ error: 'Application not found' });
    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get application stats
export const getApplicationStats = async (req, res) => {
  try {
    const stats = await Application.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get dashboard data
export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id; // Get userId from authenticated request
    
    // Get total applications count
    const totalApplications = await Application.countDocuments({ userId });
    
    // Get count by status
    const statusCounts = await Application.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Calculate active applications (not rejected or withdrawn)
    const activeApplications = statusCounts
      .filter(s => !['rejected', 'withdrawn'].includes(s._id))
      .reduce((sum, s) => sum + s.count, 0);
    
    // Get offers count
    const offersCount = statusCounts.find(s => s._id === 'offered')?.count || 0;
    
    // Get rejected count
    const rejectedCount = statusCounts.find(s => s._id === 'rejected')?.count || 0;
    
    // Get recent applications (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentCount = await Application.countDocuments({
      userId,
      appliedDate: { $gte: sevenDaysAgo }
    });
    
    // Calculate percentage change (mock for now, would need historical data)
    const totalTrend = totalApplications > 0 ? Math.round((recentCount / totalApplications) * 100) : 0;
    const activeTrend = activeApplications > 0 ? Math.round((recentCount / activeApplications) * 100) : 0;
    const offersTrend = offersCount > 0 ? Math.round((offersCount / totalApplications) * 100) : 0;
    
    // Get recent applications (limit 5)
    const recentApplications = await Application.find({ userId })
      .sort({ appliedDate: -1 })
      .limit(5);
    
    // Get upcoming reminders/interviews (limit 5)
    const upcomingReminders = await Reminder.find({
      userId,
      reminderDate: { $gte: new Date() },
      isCompleted: false
    })
      .sort({ reminderDate: 1 })
      .limit(5)
      .populate('applicationId');
    
    // Get weekly activity data
    const weekActivity = await getWeeklyActivity(userId);
    
    res.json({
      stats: {
        total: totalApplications,
        active: activeApplications,
        offers: offersCount,
        rejected: rejectedCount,
        trends: {
          total: totalTrend,
          active: activeTrend,
          offers: offersTrend
        }
      },
      recentApplications,
      upcomingReminders,
      weekActivity,
      statusBreakdown: statusCounts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function to get weekly activity
const getWeeklyActivity = async (userId) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const weekData = [];
  
  // Calculate the start of the current week (Sunday)
  const startOfWeek = new Date(today);
  const dayOfWeek = startOfWeek.getDay();
  startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);
  
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
    
    // Count interviews (reminders with type 'interview' for that day)
    const interviewCount = await Reminder.countDocuments({
      userId,
      reminderDate: {
        $gte: date,
        $lt: nextDate
      },
      type: 'interview'
    });
    
    weekData.push({
      day: days[date.getDay()],
      applied: applicationCount,
      interviews: interviewCount
    });
  }
  
  return weekData;
};
