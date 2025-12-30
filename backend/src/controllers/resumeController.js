import Resume from '../models/Resume.js';
import { extractResumeText } from '../services/resumeParser.js';
import { calculateATSScore } from '../services/atsScorer.js';
import path from 'path';
import fs from 'fs';

// naive ATS score estimation based on file type (placeholder)
const estimateAtsScore = async (data) => {
  // If we have a file path, extract text and compute ATS score
  if (data.fileUrl) {
    try {
      const filepath = path.join(process.cwd(), 'uploads', path.basename(data.fileUrl));
      if (fs.existsSync(filepath)) {
        const resumeText = await extractResumeText({ path: filepath });
        const result = calculateATSScore(resumeText);
        return result.atsScore;
      }
    } catch (err) {
      console.warn('ATS scoring failed:', err.message);
    }
  }
  // Fallback: return a baseline score
  return 65;
};

// Get all resumes
export const getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find().sort({ createdAt: -1 });
    const withScores = await Promise.all(
      resumes.map(async (r) => {
        const obj = r.toObject();
        if (typeof obj.atsScore !== 'number') {
          obj.atsScore = await estimateAtsScore(obj);
        }
        return obj;
      })
    );
    res.json(withScores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single resume
export const getResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ error: 'Resume not found' });
    const obj = resume.toObject();
    if (typeof obj.atsScore !== 'number') {
      obj.atsScore = await estimateAtsScore(obj);
    }
    res.json(obj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create resume
export const createResume = async (req, res) => {
  try {
    // Support both JSON and multipart via multer
    const file = req.file;
    const base = req.body || {};
    const payload = { ...base };
    if (file) {
      payload.filename = file.originalname;
      payload.fileSize = file.size;
      payload.fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
      // Extract and score resume using local parser and scorer
      try {
        const filepath = path.join(process.cwd(), 'uploads', file.filename);
        const resumeText = await extractResumeText({ path: filepath });
        const result = calculateATSScore(resumeText);
        payload.atsScore = result.atsScore;
        payload.aiAnalysis = {
          atsScore: result.atsScore,
          strengths: [
            `Found ${result.detectedSections.length} standard resume sections`,
            `Detected ${result.matchedSkills.length} technical skills`,
            `${result.actionVerbCount} action verbs used`,
            `${result.numberCount} quantifiable metrics included`,
          ],
          improvements: result.suggestions,
          keywords: result.matchedSkills,
          analyzedAt: new Date(),
        };
      } catch (err) {
        console.warn('Resume analysis failed:', err.message);
        payload.atsScore = await estimateAtsScore(payload);
      }
    }
    if (typeof payload.atsScore !== 'number') {
      payload.atsScore = typeof base.atsScore === 'number' ? base.atsScore : await estimateAtsScore(payload);
    }
    const resume = new Resume(payload);
    await resume.save();
    res.status(201).json(resume);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update resume
export const updateResume = async (req, res) => {
  try {
    const file = req.file;
    const base = req.body || {};
    const data = { ...base, updatedAt: new Date() };
    
    // If a file is uploaded, update file-related fields
    if (file) {
      data.filename = file.originalname;
      data.fileSize = file.size;
      data.fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
    }
    
    if (typeof data.atsScore !== 'number') {
      // Re-estimate if not provided
      const current = await Resume.findById(req.params.id);
      if (current) {
        data.atsScore = await estimateAtsScore({ ...current.toObject(), ...data });
      }
    }
    const resume = await Resume.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!resume) return res.status(404).json({ error: 'Resume not found' });
    res.json(resume);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete resume
export const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findByIdAndDelete(req.params.id);
    if (!resume) return res.status(404).json({ error: 'Resume not found' });
    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Set default resume
export const setDefaultResume = async (req, res) => {
  try {
    await Resume.updateMany({}, { isDefault: false });
    const resume = await Resume.findByIdAndUpdate(
      req.params.id,
      { isDefault: true, updatedAt: new Date() },
      { new: true }
    );
    if (!resume) return res.status(404).json({ error: 'Resume not found' });
    res.json(resume);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Clear default resume (set all to false)
export const clearDefaultResume = async (req, res) => {
  try {
    const result = await Resume.updateMany({}, { isDefault: false });
    res.json({ message: 'Default cleared', modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Upload file and attach to a resume
export const uploadResumeFile = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    const update = {
      filename: file.originalname,
      fileSize: file.size,
      fileUrl: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`,
      updatedAt: new Date(),
    };
    // Extract and score resume using local parser and scorer
    try {
      const filepath = path.join(process.cwd(), 'uploads', file.filename);
      const resumeText = await extractResumeText({ path: filepath });
      const result = calculateATSScore(resumeText);
      update.atsScore = result.atsScore;
      update.aiAnalysis = {
        atsScore: result.atsScore,
        strengths: [
          `Found ${result.detectedSections.length} standard resume sections`,
          `Detected ${result.matchedSkills.length} technical skills`,
          `${result.actionVerbCount} action verbs used`,
          `${result.numberCount} quantifiable metrics included`,
        ],
        improvements: result.suggestions,
        keywords: result.matchedSkills,
        analyzedAt: new Date(),
      };
    } catch (err) {
      console.warn('Resume analysis failed:', err.message);
      update.atsScore = await estimateAtsScore(update);
    }
    const resume = await Resume.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!resume) return res.status(404).json({ error: 'Resume not found' });
    res.json(resume);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Download resume file with Content-Disposition header to force download
export const downloadResumeFile = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ error: 'Resume not found' });
    if (!resume.fileUrl) return res.status(400).json({ error: 'No file associated' });

    // Extract filename from fileUrl
    const filename = resume.filename || 'resume.pdf';
    const filepath = path.join(process.cwd(), 'uploads', path.basename(resume.fileUrl));

    // Check if file exists
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'File not found on disk' });
    }

    // Send file with attachment header (forces download)
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.download(filepath);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Analyze resume with AI
export const analyzeResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ error: 'Resume not found' });
    if (!resume.fileUrl) return res.status(400).json({ error: 'No file to analyze' });

    // Check if analysis is cached and recent (less than 30 days old)
    if (resume.aiAnalysis && resume.aiAnalysis.analyzedAt) {
      const daysSinceAnalysis = (Date.now() - new Date(resume.aiAnalysis.analyzedAt)) / (1000 * 60 * 60 * 24);
      if (daysSinceAnalysis < 30) {
        return res.json(resume.aiAnalysis);
      }
    }

    // Get file path and extract text
    const filepath = path.join(process.cwd(), 'uploads', path.basename(resume.fileUrl));
    
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'File not found on disk' });
    }

    // Extract resume text
    const resumeText = await extractResumeText({ path: filepath });
    
    // Calculate ATS score
    const result = calculateATSScore(resumeText);

    // Prepare analysis response
    const analysis = {
      atsScore: result.atsScore,
      strengths: [
        `Found ${result.detectedSections.length} standard resume sections`,
        `Detected ${result.matchedSkills.length} technical skills`,
        `${result.actionVerbCount} action verbs used`,
        `${result.numberCount} quantifiable metrics included`,
      ],
      improvements: result.suggestions,
      keywords: result.matchedSkills.slice(0, 10),
      analyzedAt: new Date(),
    };

    // Cache the analysis in the database
    resume.aiAnalysis = analysis;
    await resume.save();
    
    res.json(analysis);
  } catch (error) {
    console.error('Resume analysis error:', error);
    res.status(500).json({ error: error.message });
  }
};
