import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  jobTitle: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['applied', 'interviewing', 'offered', 'rejected', 'withdrawn'],
    default: 'applied'
  },
  appliedDate: {
    type: Date,
    default: Date.now
  },
  jobUrl: String,
  salary: String,
  location: String,
  notes: String,
  contacts: [{
    name: String,
    position: String,
    email: String,
    phone: String
  }],
  interviewDates: [Date],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Application', applicationSchema);
