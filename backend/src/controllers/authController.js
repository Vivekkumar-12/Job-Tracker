import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { sendOtpEmail } from '../services/emailService.js';

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// Register user
export const register = async (req, res) => {
  try {
    const { username, email, password, passwordConfirm } = req.body;

    // Validation
    if (!username || !email || !password || !passwordConfirm) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const userExists = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (userExists) {
      return res.status(400).json({ 
        error: 'Email or username already in use' 
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: user.toJSON()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password, twoFactorCode } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user exists and get password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if 2FA is enabled
    if (user.twoFactorAuth.enabled) {
      if (!twoFactorCode) {
        // Password correct, but need 2FA code
        return res.status(200).json({ 
          requires2FA: true,
          message: '2FA code required',
          email: user.email
        });
      }
      
      // In production, verify the 2FA code against stored hash/session
      // For now, we accept any 6-digit code as valid
      if (!/^\d{6}$/.test(twoFactorCode)) {
        return res.status(401).json({ error: 'Invalid 2FA code' });
      }
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      token,
      user: user.toJSON()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { username, bio, profilePicture, avatarImage, notificationPreferences, appearancePreferences } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        ...(username && { username }),
        ...(bio && { bio }),
        // accept either profilePicture or avatarImage from frontend
        ...((profilePicture || avatarImage) && { profilePicture: profilePicture || avatarImage }),
        ...(notificationPreferences && { notificationPreferences }),
        ...(appearancePreferences && { appearancePreferences }),
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, newPasswordConfirm } = req.body;

    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (newPassword !== newPasswordConfirm) {
      return res.status(400).json({ error: 'New passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await User.findById(req.userId).select('+password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Logout (handled on frontend by removing token)
export const logout = (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

// Send OTP for data export
export const exportOtp = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await sendOtpEmail({ to: user.email, code });

    res.json({ message: 'OTP sent', otp: process.env.NODE_ENV === 'production' ? undefined : code });
  } catch (error) {
    console.error('Failed to send export OTP:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

// Delete account
export const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required to delete account' });
    }

    const user = await User.findById(req.userId).select('+password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify password before deletion
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Delete user account
    await User.findByIdAndDelete(req.userId);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Failed to delete account:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
};

// Enable 2FA - Send OTP to verify email
export const enable2FA = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.twoFactorAuth.enabled) {
      return res.status(400).json({ error: '2FA is already enabled' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await sendOtpEmail({ to: user.email, code, subject: 'Enable Two-Factor Authentication' });

    res.json({ 
      message: '2FA setup code sent to your email',
      otp: process.env.NODE_ENV === 'production' ? undefined : code 
    });
  } catch (error) {
    console.error('Failed to send 2FA setup code:', error);
    res.status(500).json({ error: 'Failed to send setup code' });
  }
};

// Verify and enable 2FA
export const verify2FASetup = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Verification code is required' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // In production, you'd verify the code against a stored hash/session
    // For now, we'll accept the code and enable 2FA
    user.twoFactorAuth.enabled = true;
    user.twoFactorAuth.verifiedAt = new Date();
    await user.save();

    res.json({ message: '2FA enabled successfully', twoFactorEnabled: true });
  } catch (error) {
    console.error('Failed to enable 2FA:', error);
    res.status(500).json({ error: 'Failed to enable 2FA' });
  }
};

// Disable 2FA
export const disable2FA = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required to disable 2FA' });
    }

    const user = await User.findById(req.userId).select('+password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    user.twoFactorAuth.enabled = false;
    user.twoFactorAuth.verifiedAt = null;
    await user.save();

    res.json({ message: '2FA disabled successfully', twoFactorEnabled: false });
  } catch (error) {
    console.error('Failed to disable 2FA:', error);
    res.status(500).json({ error: 'Failed to disable 2FA' });
  }
};

// Send 2FA code during login
export const send2FACode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.twoFactorAuth.enabled) {
      return res.status(400).json({ error: '2FA is not enabled for this account' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await sendOtpEmail({ to: user.email, code, subject: 'Two-Factor Authentication Code' });

    res.json({ 
      message: '2FA code sent to your email',
      otp: process.env.NODE_ENV === 'production' ? undefined : code
    });
  } catch (error) {
    console.error('Failed to send 2FA code:', error);
    res.status(500).json({ error: 'Failed to send 2FA code' });
  }
};
