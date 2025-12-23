import express from 'express';
import {
  getApplications,
  getApplication,
  createApplication,
  updateApplication,
  deleteApplication,
  getApplicationStats
} from '../controllers/applicationController.js';

const router = express.Router();

router.get('/', getApplications);
router.get('/stats', getApplicationStats);
router.get('/:id', getApplication);
router.post('/', createApplication);
router.put('/:id', updateApplication);
router.delete('/:id', deleteApplication);

export default router;
