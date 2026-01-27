import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['application', 'interview', 'reminder', 'deadline', 'achievement', 'system'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date,
    default: null
  },
  actionUrl: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
    // Auto-delete notifications after 30 days
    expires: 2592000
  },
  deletedAt: {
    type: Date,
    default: null
  }
});

// Index for efficient queries
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, deletedAt: 1 });

// Only return non-deleted notifications by default
notificationSchema.query.active = function() {
  return this.where({ deletedAt: null });
};

export default mongoose.model('Notification', notificationSchema);
