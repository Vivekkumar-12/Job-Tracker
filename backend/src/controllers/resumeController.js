import Resume from '../models/Resume.js';
import { scoreResume } from '../services/atsScoring.js';
import path from 'path';
import fs from 'fs';

// naive ATS score estimation based on file type (placeholder)
const estimateAtsScore = async (data) => {
  return scoreResume({
    title: data?.title,
    filename: data?.filename,
    fileSize: data?.fileSize || 0,
    fileUrl: data?.fileUrl,
  });
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
    }
    payload.atsScore = typeof base.atsScore === 'number' ? base.atsScore : await estimateAtsScore(payload);
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
    const data = { ...req.body, updatedAt: new Date() };
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
    // Re-score including fileSize and filename
    update.atsScore = await estimateAtsScore(update);
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
