import dotenv from 'dotenv';
import connectDB from './config/db.js';
import app from './app.js';
import { startReminderScheduler } from './services/reminderScheduler.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const MAX_PORT_ATTEMPTS = 3;

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

    // Start the reminder scheduler for long-running instances
    startReminderScheduler();
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
