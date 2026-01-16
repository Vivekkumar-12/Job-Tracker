import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import resumeBuilderController from '../controllers/resumeBuilderController.js';

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage with original filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Keep original filename with timestamp to avoid conflicts
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${timestamp}${ext}`);
  }
});

// Configure multer for file uploads
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['application/pdf', 'application/msword', 
                          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents are allowed'), false);
    }
  }
});

// ============ Resume CRUD Operations ============
// IMPORTANT: Specific routes must come before dynamic :id routes
router.get('/templates', resumeBuilderController.getTemplates);
router.post('/analyze-file', upload.single('resume'), resumeBuilderController.analyzeResumeFile);
router.get('/', resumeBuilderController.getResumes);
router.post('/', upload.single('file'), resumeBuilderController.createResume);
router.get('/:id', resumeBuilderController.getResume);
router.put('/:id', upload.single('file'), resumeBuilderController.updateResume);
router.delete('/:id', resumeBuilderController.deleteResume);

// ============ ATS Scoring & Optimization ============
router.post('/:id/calculate-ats', resumeBuilderController.calculateAtsScore);
router.post('/:id/analyze', resumeBuilderController.analyzeExistingResume);
router.post('/:id/optimize-for-job', resumeBuilderController.optimizeForJob);
router.get('/:id/versions', resumeBuilderController.getVersionHistory);
router.post('/:id/restore-version', resumeBuilderController.restoreVersion);

// ============ AI Enhancement Features ============
router.post('/:id/generate-summary', resumeBuilderController.generateSummary);
router.post('/:id/optimize-bullet-points', resumeBuilderController.optimizeBulletPoints);
router.post('/:id/suggest-skills', resumeBuilderController.suggestSkills);
router.post('/:id/improve-clarity', resumeBuilderController.improveClarityAndGrammar);

// ============ Export & Download ============
router.get('/:id/export-pdf', resumeBuilderController.exportPDF);
router.get('/:id/export-docx', resumeBuilderController.exportDOCX);

// ============ Resume Management ============
router.put('/:id/toggle-pin', resumeBuilderController.togglePin);

export default router;
