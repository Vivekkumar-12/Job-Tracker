import mongoose from 'mongoose';

const resumeSectionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['PERSONAL', 'SUMMARY', 'SKILLS', 'EXPERIENCE', 'EDUCATION', 'PROJECTS', 'CERTIFICATIONS', 'ACHIEVEMENTS', 'CUSTOM'],
    required: true
  },
  title: String,
  content: mongoose.Schema.Types.Mixed, // Flexible content based on section type
  order: Number,
  isVisible: {
    type: Boolean,
    default: true
  }
});

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    default: 'My Resume'
  },
  templateId: {
    type: String,
    enum: ['ats-classic', 'ats-modern', 'sde-template', 'data-analyst', 'product-manager', 'fresher', 'experienced'],
    default: 'ats-classic'
  },
  sections: [resumeSectionSchema],
  
  // Personal Information
  personalInfo: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    location: String,
    linkedin: String,
    portfolio: String,
    github: String
  },

  // Professional Summary
  summary: {
    content: String,
    generatedByAI: Boolean
  },

  // Skills
  skills: {
    technical: [String],
    professional: [String],
    languages: [String]
  },

  // Work Experience
  workExperience: [{
    company: String,
    position: String,
    startDate: Date,
    endDate: Date,
    currentlyWorking: Boolean,
    description: String,
    achievements: [String],
    keywords: [String],
    optimizedBulletPoints: [String]
  }],

  // Education
  education: [{
    institution: String,
    degree: String,
    field: String,
    startDate: Date,
    endDate: Date,
    cgpa: String,
    activities: String
  }],

  // Projects
  projects: [{
    name: String,
    description: String,
    technologies: [String],
    link: String,
    github: String,
    startDate: Date,
    endDate: Date,
    achievements: [String]
  }],

  // Certifications
  certifications: [{
    name: String,
    issuer: String,
    issueDate: Date,
    expiryDate: Date,
    credentialId: String,
    credentialUrl: String
  }],

  // Achievements
  achievements: [{
    title: String,
    description: String,
    date: Date
  }],

  // Custom Sections
  customSections: [{
    title: String,
    content: String,
    order: Number
  }],

  // ATS Optimization
  atsScore: {
    overallScore: Number, // 0-100
    keywordMatch: Number,
    completeness: Number,
    formatting: Number,
    lastCalculated: Date,
    jobDescription: String,
    matchedKeywords: [String],
    missingKeywords: [String],
    suggestions: [String]
  },

  // Version Control
  version: {
    type: Number,
    default: 1
  },
  previousVersions: [{
    versionNumber: Number,
    content: mongoose.Schema.Types.Mixed,
    createdAt: Date,
    changedFields: [String]
  }],

  // Export Settings
  exportSettings: {
    includePersonalEmail: { type: Boolean, default: true },
    includePhone: { type: Boolean, default: true },
    theme: { type: String, default: 'clean' }
  },

  // Metadata
  isPublic: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },
  views: { type: Number, default: 0 },

  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Index for fast queries
resumeSchema.index({ userId: 1, createdAt: -1 });
resumeSchema.index({ userId: 1, isPinned: -1 });

// Auto-update updatedAt timestamp
resumeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method to calculate completeness score
resumeSchema.methods.calculateCompleteness = function() {
  const sections = {
    personalInfo: this.personalInfo?.firstName && this.personalInfo?.email ? 1 : 0,
    summary: this.summary?.content ? 1 : 0,
    skills: this.skills?.technical?.length > 0 ? 1 : 0,
    experience: this.workExperience?.length > 0 ? 1 : 0,
    education: this.education?.length > 0 ? 1 : 0
  };
  
  const completeness = (Object.values(sections).reduce((a, b) => a + b, 0) / Object.keys(sections).length) * 100;
  return Math.round(completeness);
};

// Method to get all non-empty sections
resumeSchema.methods.getActiveSections = function() {
  return this.sections.filter(s => s.isVisible);
};

// Method to create version snapshot
resumeSchema.methods.createVersionSnapshot = function(changedFields = []) {
  this.previousVersions.push({
    versionNumber: this.version,
    content: {
      personalInfo: this.personalInfo,
      summary: this.summary,
      skills: this.skills,
      workExperience: this.workExperience,
      education: this.education,
      projects: this.projects,
      certifications: this.certifications,
      achievements: this.achievements,
      customSections: this.customSections
    },
    createdAt: new Date(),
    changedFields
  });
  this.version += 1;
};

export default mongoose.model('Resume', resumeSchema);
