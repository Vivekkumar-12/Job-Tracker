import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false // Don't include password by default in queries
  },
  notificationPreferences: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    interview: { type: Boolean, default: true },
    deadline: { type: Boolean, default: true },
    digest: { type: Boolean, default: false },
  },
  appearancePreferences: {
    darkMode: { type: Boolean, default: true },
    accentColor: { type: String, default: 'blue', enum: ['blue', 'purple', 'green', 'orange', 'pink'] },
    defaultView: { type: String, default: 'dashboard', enum: ['dashboard', 'applications', 'search'] },
  },
  profilePicture: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    default: ''
  },
  twoFactorAuth: {
    enabled: { type: Boolean, default: false },
    verifiedAt: { type: Date, default: null }
  },
  pushNotification: {
    enabled: { type: Boolean, default: false },
    subscription: {
      endpoint: String,
      keys: {
        p256dh: String,
        auth: String
      }
    },
    subscribedAt: { type: Date, default: null },
    unsubscribedAt: { type: Date, default: null }
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

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model('User', userSchema);
