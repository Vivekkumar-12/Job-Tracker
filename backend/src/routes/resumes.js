import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  getResumes,
  getResume,
  createResume,
  updateResume,
  deleteResume,
  setDefaultResume,
  clearDefaultResume,
  uploadResumeFile,
  downloadResumeFile,
} from '../controllers/resumeController.js';

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage: save to uploads folder with timestamp prefix
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${timestamp}_${sanitized}`);
  },
});
const upload = multer({ storage });

router.get('/', getResumes);
router.get('/:id', getResume);
// Support multipart create with optional file
router.post('/', upload.single('file'), createResume);
router.put('/:id', updateResume);
router.delete('/:id', deleteResume);
router.patch('/:id/default', setDefaultResume);
router.patch('/default/clear', clearDefaultResume);
router.patch('/:id/file', upload.single('file'), uploadResumeFile);
router.get('/:id/download', downloadResumeFile);

export default router;
