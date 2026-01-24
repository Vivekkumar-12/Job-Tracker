import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import verifyToken from './middleware/auth.js';
// Routes
import authRoutes from './routes/auth.js';
import applicationRoutes from './routes/applications.js';
import resumeRoutes from './routes/resumes.js';
import reminderRoutes from './routes/reminders.js';
import jobListingRoutes from './routes/jobListings.js';
import coverLetterRoutes from './routes/coverLetters.js';
import searchRoutes from './routes/search.js';
import notificationRoutes from './routes/notifications.js';

// Load env vars in both serverless and local dev
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'your-frontend-url.com' : '*',
  credentials: true,
}));
// Increase body size limits to handle base64 avatars and resume content
app.use(express.json({ limit: '6mb' }));
app.use(express.urlencoded({ extended: true, limit: '6mb' }));
// Static serving for uploaded files (note: not persisted on Vercel)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running', timestamp: new Date() });
});

// DEBUG: Test pdf-parse loading
app.get('/api/debug/pdf-parse', async (req, res) => {
  try {
    console.log('[DEBUG] ========== PDF-PARSE DIAGNOSTIC ==========');
    let pdfParse;

    // Test direct import
    try {
      const pdfParseModule = await import('pdf-parse');
      console.log('[DEBUG] ESM import successful');
      console.log('[DEBUG] Module type:', typeof pdfParseModule);
      console.log('[DEBUG] Module keys:', Object.keys(pdfParseModule));
      pdfParse = pdfParseModule.default || pdfParseModule;
      console.log('[DEBUG] Resolved pdfParse type:', typeof pdfParse);
    } catch (importErr) {
      console.error('[DEBUG] ESM import failed:', importErr.message);
    }

    // Test CommonJS require (in case it works differently)
    try {
      const { createRequire } = await import('module');
      const require = createRequire(import.meta.url);
      const pdfParseModule = require('pdf-parse');
      console.log('[DEBUG] CommonJS require successful');
      console.log('[DEBUG] Require module type:', typeof pdfParseModule);
      console.log('[DEBUG] Require module keys:', Object.keys(pdfParseModule));
    } catch (reqErr) {
      console.error('[DEBUG] CommonJS require failed:', reqErr.message);
    }

    res.json({
      message: 'Check server console for pdf-parse diagnostic output',
      pdfParseAvailable: typeof pdfParse === 'function',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Auth Routes (public)
app.use('/api/auth', authRoutes);

// Protected API Routes (require authentication)
app.use('/api/applications', verifyToken, applicationRoutes);
app.use('/api/resumes', verifyToken, resumeRoutes);
app.use('/api/cover-letters', verifyToken, coverLetterRoutes);
app.use('/api/reminders', verifyToken, reminderRoutes);
app.use('/api/job-listings', verifyToken, jobListingRoutes);
app.use('/api/notifications', verifyToken, notificationRoutes);
app.use('/api/search', searchRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

export default app;
