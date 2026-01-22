import express from 'express';
import {
  register,
  login,
  logout,
  getCurrentUser,
  updateProfile,
  changePassword,
  exportOtp,
  deleteAccount,
  enable2FA,
  verify2FASetup,
  disable2FA,
  send2FACode
} from '../controllers/authController.js';
import verifyToken from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/2fa/send', send2FACode);

// Protected routes
router.get('/me', verifyToken, getCurrentUser);
router.put('/profile', verifyToken, updateProfile);
router.post('/change-password', verifyToken, changePassword);
router.post('/export-otp', verifyToken, exportOtp);
router.post('/logout', verifyToken, logout);
router.delete('/account', verifyToken, deleteAccount);

// 2FA routes
router.post('/2fa/enable', verifyToken, enable2FA);
router.post('/2fa/verify-setup', verifyToken, verify2FASetup);
router.post('/2fa/disable', verifyToken, disable2FA);

export default router;
