import express from 'express';
import resumeBuilderController from '../controllers/resumeBuilderController.js';

const router = express.Router();

// ============ Resume CRUD Operations ============
router.get('/', resumeBuilderController.getResumes);
router.get('/templates', resumeBuilderController.getTemplates);
router.post('/', resumeBuilderController.createResume);
router.get('/:id', resumeBuilderController.getResume);
router.put('/:id', resumeBuilderController.updateResume);
router.delete('/:id', resumeBuilderController.deleteResume);

// ============ ATS Scoring & Optimization ============
router.post('/:id/calculate-ats', resumeBuilderController.calculateAtsScore);
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
