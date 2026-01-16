/**
 * Resume Controller
 * Handles all resume-related endpoints
 */

import fs from 'fs';
import path from 'path';
import Resume from '../models/Resume.js';
import resumeAiEnhancer from '../services/resumeAiEnhancer.js';
import resumeExportService from '../services/resumeExportService.js';
import { analyzeResumeLocally } from '../services/localAts.js';
import { scoreResumeFile } from '../services/universalAts.js';

/**
 * GET /api/resumes - Get all resumes for a user
 */
export const getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id })
      .select('-previousVersions')
      .sort({ isPinned: -1, createdAt: -1 });

    res.json({
      success: true,
      count: resumes.length,
      data: resumes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/resumes/:id - Get a specific resume
 */
export const getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    res.json({
      success: true,
      data: resume
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/resumes - Create a new resume
 */
export const createResume = async (req, res) => {
  try {
    const file = req.file;
    const { title, templateId, personalInfo } = req.body;

    const resume = new Resume({
      userId: req.user.id,
      title: title || 'My Resume',
      templateId: templateId || 'ats-classic',
      personalInfo: personalInfo || {},
      skills: { technical: [], professional: [], languages: [] },
      workExperience: [],
      education: [],
      projects: [],
      certifications: [],
      achievements: [],
      customSections: [],
      sections: []
    });

    // Handle file upload if provided
    if (file) {
      resume.filename = file.originalname;
      resume.fileSize = file.size;
      resume.fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
      console.log(`[CREATE RESUME] File uploaded: ${file.originalname} -> ${file.filename}`);
    }

    await resume.save();

    res.status(201).json({
      success: true,
      message: 'Resume created successfully',
      data: resume
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * PUT /api/resumes/:id - Update a resume
 */
export const updateResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    // Track changed fields
    const changedFields = [];
    const updateData = req.body;

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (key !== '_id' && key !== 'userId' && resume[key] !== updateData[key]) {
        changedFields.push(key);
        resume[key] = updateData[key];
      }
    });

    // Handle file upload if provided
    const file = req.file;
    if (file) {
      resume.filename = file.originalname;
      resume.fileSize = file.size;
      resume.fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
      changedFields.push('filename', 'fileSize', 'fileUrl');
      console.log(`[UPDATE RESUME] File uploaded: ${file.originalname} -> ${file.filename}`);
    }

    // Create version snapshot before saving
    if (changedFields.length > 0) {
      resume.createVersionSnapshot(changedFields);
    }

    await resume.save();

    res.json({
      success: true,
      message: 'Resume updated successfully',
      data: resume
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * DELETE /api/resumes/:id - Delete a resume
 */
export const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    res.json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/resumes/:id/calculate-ats - Calculate ATS score
 */
export const calculateAtsScore = async (req, res) => {
  try {
    const { jobDescription } = req.body;
    
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    // Require an uploaded file to score locally
    if (!resume.fileUrl) {
      console.error('[ATS] No fileUrl on resume:', resume._id);
      return res.status(400).json({ error: 'No resume file found. Please upload a PDF or DOCX.' });
    }

    // Extract filename from URL or use it directly if it's just a filename
    let storedFilename = resume.fileUrl;
    if (resume.fileUrl.includes('/')) {
      storedFilename = path.basename(resume.fileUrl);
    }
    const filePath = path.join(process.cwd(), 'uploads', storedFilename);

    console.log('[ATS] Checking file:', {
      fileUrl: resume.fileUrl,
      storedFilename,
      filePath,
      exists: fs.existsSync(filePath)
    });

    if (!fs.existsSync(filePath)) {
      console.error('[ATS] File not found at:', filePath);
      return res.status(404).json({ error: `Uploaded resume file is missing on server. Expected at: ${filePath}` });
    }

    // Calculate ATS score offline using universal scorer
    console.log('[ATS] Starting scoreResumeFile:', { filePath, resumeTitle: resume.title });
    const atsResult = await scoreResumeFile({
      filePath,
      jobDescription: jobDescription || '',
      jobTitle: resume.title || ''
    });
    console.log('[ATS] Full result with breakdown:', JSON.stringify(atsResult, null, 2));

    // Persist schema-friendly ATS data
    resume.atsScore = {
      overallScore: atsResult.atsScore,
      lastCalculated: new Date(),
      jobDescription: jobDescription || '',
      breakdown: atsResult.breakdown
    };
    await resume.save();
    console.log('[ATS] Saved to resume:', resume.atsScore);

    res.json({
      success: true,
      message: 'ATS score calculated locally',
      data: atsResult
    });
  } catch (error) {
    console.error('[ATS] Error in calculateAtsScore:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/resumes/:id/generate-summary - Generate professional summary
 */
export const generateSummary = async (req, res) => {
  try {
    const { jobRole } = req.body;

    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const summary = await resumeAiEnhancer.generateSummary(resume, jobRole || 'Software Professional');

    res.json({
      success: true,
      data: {
        summary,
        preview: summary.substring(0, 100) + '...'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/resumes/:id/optimize-bullet-points - Optimize work experience bullet points
 */
export const optimizeBulletPoints = async (req, res) => {
  try {
    const { bulletPoints, experienceIndex } = req.body;

    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const optimized = await resumeAiEnhancer.optimizeBulletPoints(bulletPoints);

    // Update resume
    if (experienceIndex !== undefined && resume.workExperience[experienceIndex]) {
      resume.workExperience[experienceIndex].optimizedBulletPoints = optimized;
      await resume.save();
    }

    res.json({
      success: true,
      data: {
        original: bulletPoints,
        optimized
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/resumes/:id/optimize-for-job - Optimize resume for specific job
 */
export const optimizeForJob = async (req, res) => {
  try {
    const { jobDescription } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ error: 'Job description is required' });
    }

    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const suggestions = await resumeAiEnhancer.optimizeForJob(resume, jobDescription);

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/resumes/:id/suggest-skills - Get skill suggestions for a role
 */
export const suggestSkills = async (req, res) => {
  try {
    const { role } = req.body;

    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const currentSkills = [
      ...(resume.skills?.technical || []),
      ...(resume.skills?.professional || [])
    ];

    const suggestions = await resumeAiEnhancer.suggestSkills(role || 'Software Engineer', currentSkills);

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/resumes/:id/improve-clarity - Improve grammar and clarity
 */
export const improveClarityAndGrammar = async (req, res) => {
  try {
    const { text, field } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const improved = await resumeAiEnhancer.improveClarityAndGrammar(text);

    res.json({
      success: true,
      data: {
        original: text,
        improved,
        field
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/resumes/:id/export-pdf - Export resume as PDF
 */
export const exportPDF = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const filename = `resume-${resume._id}`;
    const filepath = await resumeExportService.exportPDF(resume, filename);

    res.download(filepath, `${resume.title || 'resume'}.pdf`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/resumes/:id/export-docx - Export resume as DOCX
 */
export const exportDOCX = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const filename = `resume-${resume._id}`;
    const filepath = await resumeExportService.exportDOCX(resume, filename);

    res.download(filepath, `${resume.title || 'resume'}.docx`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/resumes/:id/versions - Get version history
 */
export const getVersionHistory = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).select('version previousVersions createdAt updatedAt');

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    res.json({
      success: true,
      data: {
        currentVersion: resume.version,
        history: resume.previousVersions.map(v => ({
          versionNumber: v.versionNumber,
          createdAt: v.createdAt,
          changedFields: v.changedFields
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/resumes/:id/restore-version - Restore from previous version
 */
export const restoreVersion = async (req, res) => {
  try {
    const { versionNumber } = req.body;

    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const versionSnapshot = resume.previousVersions.find(v => v.versionNumber === versionNumber);

    if (!versionSnapshot) {
      return res.status(404).json({ error: 'Version not found' });
    }

    // Create current version snapshot before restoring
    resume.createVersionSnapshot(['restored from version ' + versionNumber]);

    // Restore content
    Object.assign(resume, versionSnapshot.content);

    await resume.save();

    res.json({
      success: true,
      message: `Restored to version ${versionNumber}`,
      data: resume
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * PUT /api/resumes/:id/toggle-pin - Pin/unpin resume
 */
export const togglePin = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    resume.isPinned = !resume.isPinned;
    await resume.save();

    res.json({
      success: true,
      data: {
        isPinned: resume.isPinned
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/resumes/templates - Get available templates
 */
export const getTemplates = async (req, res) => {
  try {
    const templates = [
      {
        id: 'ats-classic',
        name: 'ATS Classic',
        description: 'Simple, ATS-friendly format for maximum compatibility',
        category: 'ATS-Safe'
      },
      {
        id: 'ats-modern',
        name: 'ATS Modern',
        description: 'Clean modern design that\'s still ATS-safe',
        category: 'ATS-Safe'
      },
      {
        id: 'sde-template',
        name: 'Software Engineer',
        description: 'Optimized for software development roles',
        category: 'Role-Specific'
      },
      {
        id: 'data-analyst',
        name: 'Data Analyst',
        description: 'Emphasizes data skills and analysis experience',
        category: 'Role-Specific'
      },
      {
        id: 'product-manager',
        name: 'Product Manager',
        description: 'Highlights product strategy and leadership',
        category: 'Role-Specific'
      },
      {
        id: 'fresher',
        name: 'Fresher',
        description: 'Perfect for graduates and entry-level professionals',
        category: 'Experience-Level'
      },
      {
        id: 'experienced',
        name: 'Experienced Professional',
        description: 'For mid to senior level professionals',
        category: 'Experience-Level'
      }
    ];

    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/resumes/analyze-file - Analyze uploaded resume file for ATS score
 */
export const analyzeResumeFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    
    // Analyze the file locally
    const analysis = await analyzeResumeLocally(filePath);

    res.json({
      success: true,
      message: 'Resume file analyzed',
      data: {
        atsScore: analysis.atsScore,
        strengths: analysis.strengths,
        improvements: analysis.improvements,
        keywords: analysis.keywords,
        fileName: req.file.originalname
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/resumes/:id/analyze - Analyze existing resume and provide suggestions
 */
export const analyzeExistingResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    if (!resume.fileUrl) {
      return res.status(400).json({ error: 'No file attached to this resume' });
    }

    // Extract filename from URL
    let storedFilename = resume.fileUrl;
    if (resume.fileUrl.includes('/')) {
      storedFilename = path.basename(resume.fileUrl);
    }
    const filePath = path.join(process.cwd(), 'uploads', storedFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Resume file not found on server' });
    }

    // Analyze the resume
    const analysis = await analyzeResumeLocally(filePath);

    // Format issues and corrections
    const issues = analysis.improvements.map((imp, idx) => ({
      type: idx % 3 === 0 ? 'error' : idx % 2 === 0 ? 'warning' : 'info',
      text: imp
    }));

    const corrections = analysis.improvements.slice(0, 5).map(imp => 
      imp.replace(/^Add /, 'Consider adding ').replace(/^Include /, 'Try including ')
    );

    res.json({
      success: true,
      data: {
        score: Math.min(100, Math.max(0, Math.round(analysis.atsScore))),
        totalIssues: analysis.improvements.length,
        issues,
        corrections,
        strengths: analysis.strengths,
        keywords: analysis.keywords || []
      }
    });
  } catch (error) {
    console.error('[ANALYZE] Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export default {
  getResumes,
  getResume,
  createResume,
  updateResume,
  deleteResume,
  calculateAtsScore,
  generateSummary,
  optimizeBulletPoints,
  optimizeForJob,
  suggestSkills,
  improveClarityAndGrammar,
  exportPDF,
  exportDOCX,
  getVersionHistory,
  restoreVersion,
  togglePin,
  getTemplates,
  analyzeResumeFile,
  analyzeExistingResume
};
