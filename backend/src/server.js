import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import verifyToken from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import applicationRoutes from './routes/applications.js';
import resumeRoutes from './routes/resumes.js';
import reminderRoutes from './routes/reminders.js';
import jobListingRoutes from './routes/jobListings.js';
import coverLetterRoutes from './routes/coverLetters.js';
import searchRoutes from './routes/search.js';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'your-frontend-url.com' : '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Static serving for uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running', timestamp: new Date() });
});

// Auth Routes (public)
app.use('/api/auth', authRoutes);

// Protected API Routes (require authentication)
app.use('/api/applications', verifyToken, applicationRoutes);
app.use('/api/resumes', verifyToken, resumeRoutes);
app.use('/api/cover-letters', verifyToken, coverLetterRoutes);
app.use('/api/reminders', verifyToken, reminderRoutes);
app.use('/api/job-listings', verifyToken, jobListingRoutes);
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

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`API Health Check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
