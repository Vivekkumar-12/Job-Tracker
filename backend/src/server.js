import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
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
import path from 'path';
// Services
import { startReminderScheduler } from './services/reminderScheduler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MAX_PORT_ATTEMPTS = 3;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'your-frontend-url.com' : '*',
  credentials: true
}));
// Increase body size limits to handle base64 avatars and resume content
app.use(express.json({ limit: '6mb' }));
app.use(express.urlencoded({ extended: true, limit: '6mb' }));
// Static serving for uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running', timestamp: new Date() });
});

// DEBUG: Test pdf-parse loading
app.get('/api/debug/pdf-parse', async (req, res) => {
  try {
    console.log('[DEBUG] ========== PDF-PARSE DIAGNOSTIC ==========');
    
    // Test direct import
    let pdfParse;
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
      pdfParseAvailable: typeof pdfParse === 'function'
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

// Start server with retry if port is in use
const listenWithRetry = (port, attempt = 1) =>
  new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
      console.log(`API Health Check: http://localhost:${port}/api/health`);
      resolve(server);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE' && attempt < MAX_PORT_ATTEMPTS) {
        const nextPort = Number(port) + 1;
        console.warn(`Port ${port} in use, trying ${nextPort} (attempt ${attempt + 1}/${MAX_PORT_ATTEMPTS})`);
        server.close(() => resolve(listenWithRetry(nextPort, attempt + 1)));
      } else {
        reject(err);
      }
    });
  });

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB();
    const basePort = Number(PORT) || 5000;
    await listenWithRetry(basePort);
    
    // Start the reminder scheduler
    startReminderScheduler();
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
