import mongoose from 'mongoose';

const jobListingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  description: String,
  location: String,
  salary: String,
  jobUrl: {
    type: String,
    required: true
  },
  source: {
    type: String,
    enum: ['linkedin', 'indeed', 'glassdoor', 'other'],
    default: 'other'
  },
  skills: [String],
  isBookmarked: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('JobListing', jobListingSchema);
