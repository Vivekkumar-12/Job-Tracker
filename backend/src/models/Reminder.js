import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema({
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
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  },
  isCompleted: {
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
