import dotenv from 'dotenv';
import app from '../src/app.js';
import connectDB from '../src/config/db.js';

// Load env vars (Vercel provides env, but keep for local dev with vercel dev)
dotenv.config({ path: '../.env' });

let dbPromise;
const ensureDB = async () => {
  if (!dbPromise) {
    dbPromise = connectDB();
  }
  return dbPromise;
};

export default async function handler(req, res) {
  try {
    await ensureDB();
    return app(req, res);
  } catch (err) {
    console.error('Serverless handler error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
