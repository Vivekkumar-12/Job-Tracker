import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  reminderDate: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['interview', 'followup', 'deadline', 'other'],
    default: 'other'
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  company: {
    type: String
  },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  emailNotifyBefore: {
    type: Number, // in minutes before the reminder
    default: 60 // default 1 hour before
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Reminder', reminderSchema);
