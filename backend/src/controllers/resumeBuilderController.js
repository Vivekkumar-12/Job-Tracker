/**
 * Resume Controller
 * Handles all resume-related endpoints
 */

import Resume from '../models/Resume.js';
import resumeAtsScorer from '../services/resumeAtsScorer.js';
import resumeAiEnhancer from '../services/resumeAiEnhancer.js';
import resumeExportService from '../services/resumeExportService.js';

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

    // Calculate ATS score
    const atsScore = await resumeAtsScorer.scoreResume(resume, jobDescription);

    // Update resume with ATS score
    resume.atsScore = {
      ...atsScore,
      lastCalculated: new Date(),
      jobDescription: jobDescription || ''
    };

    await resume.save();

    res.json({
      success: true,
      message: 'ATS score calculated',
      data: atsScore
    });
  } catch (error) {
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
  getTemplates
};
