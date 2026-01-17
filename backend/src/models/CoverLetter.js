import mongoose from 'mongoose';

const coverLetterSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    default: 'My Cover Letter'
  },
  content: {
    type: String,
    default: ''
  },
  // Optional uploaded file metadata
  filename: String,
  fileSize: Number,
  fileUrl: String,

  // Frontend usage metadata
  usedFor: { type: Number, default: 0 },
  isProtected: { type: Boolean, default: false },
  lastModified: { type: Date, default: Date.now },

  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now, index: true }
});

coverLetterSchema.index({ userId: 1, createdAt: -1 });

coverLetterSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('CoverLetter', coverLetterSchema);
