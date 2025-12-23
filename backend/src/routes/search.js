import { Router } from 'express';
import verifyToken from '../middleware/auth.js';
import { searchJobs } from '../controllers/searchController.js';

const router = Router();

// GET /api/search/jobs?q=...&location=...&job_type=...&category=...&min_salary=...
router.get('/jobs', verifyToken, searchJobs);

export default router;
