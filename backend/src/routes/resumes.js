import express from 'express';
import {
  getResumes,
  getResume,
  createResume,
  updateResume,
  deleteResume,
  setDefaultResume
} from '../controllers/resumeController.js';

const router = express.Router();

router.get('/', getResumes);
router.get('/:id', getResume);
router.post('/', createResume);
router.put('/:id', updateResume);
router.delete('/:id', deleteResume);
router.patch('/:id/default', setDefaultResume);

export default router;
