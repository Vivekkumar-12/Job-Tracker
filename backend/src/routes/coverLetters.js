import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import coverLetterController from '../controllers/coverLetterController.js';

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage keeping original filename + timestamp
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ts = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${ts}${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown',
      'text/html'
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only PDF, Word, Text, Markdown, or HTML files are allowed'), false);
  }
});

// CRUD Routes
router.get('/', coverLetterController.getCoverLetters);
router.post('/', upload.single('file'), coverLetterController.createCoverLetter);
router.get('/:id', coverLetterController.getCoverLetter);
router.put('/:id', upload.single('file'), coverLetterController.updateCoverLetter);
router.delete('/:id', coverLetterController.deleteCoverLetter);
// Extract text content from existing file and save into content
router.post('/:id/extract-content', coverLetterController.extractCoverLetterContent);
// Extract text from uploaded file without saving (for preview)
router.post('/extract-text', upload.single('file'), coverLetterController.extractTextFromUpload);

export default router;
