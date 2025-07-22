const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../middleware/sendEmail');
const { generateToken, verifyToken } = require('../middleware/jwtUtils');

const router = express.Router();

// Use the deployed frontend URL for email links. Set FRONTEND_URL in Render environment variables.
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
console.log('FRONTEND_URL being used:', FRONTEND_URL);

// Signup
router.post('/signup', async (req, res) => {
  const { email, password, role } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({
      email,
      password: hashedPassword,
      role: role || 'user',
      isVerified: false
    });
    await user.save();
    // Generate verification token
    const token = generateToken({ userId: user._id }, '1h');
    // Email confirmation link uses the deployed frontend URL
    const verifyLink = `${FRONTEND_URL}/verify-email?token=${token}`;
    await sendEmail(
      email,
      'Verify your email',
      `<p>Please verify your email by clicking <a href="${verifyLink}">here</a>.</p>`
    );
    res.json({ message: 'User registered. Please check your email to verify your account.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Email Verification
router.post('/verify-email', async (req, res) => {
  const { token } = req.body;
  console.log('Received token for verification:', token);
  if (!token) return res.status(400).json({ message: 'No token provided.' });
  try {
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        console.log('Token expired');
        return res.status(400).json({ message: 'Token expired' });
      }
      console.log('Invalid token');
      return res.status(400).json({ message: 'Verification failed' });
    }
    const user = await User.findById(payload.userId);
    if (!user) return res.status(400).json({ message: 'User not found.' });
    if (user.isVerified) return res.json({ message: 'Email already verified.' });
    user.isVerified = true;
    await user.save();
    console.log('Email verified for user:', user.email);
    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ message: 'Verification failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    if (!user.isVerified) return res.status(403).json({ error: 'Please verify your email before logging in.' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ token, role: user.role, userId: user._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });
    const resetToken = generateToken({ userId: user._id }, '1h');
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();
    // Password reset link uses the deployed frontend URL
    const resetLink = `${FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendEmail(
      email,
      'Reset your password',
      `<p>Click <a href="${resetLink}">here</a> to reset your password. This link is valid for 1 hour.</p>`
    );
    res.json({ message: 'Password reset link sent to your email.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const payload = verifyToken(token);
    if (!payload) return res.status(400).json({ message: 'Invalid or expired token.' });
    const user = await User.findById(payload.userId);
    if (!user || user.resetToken !== token || !user.resetTokenExpiry || user.resetTokenExpiry < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
    res.json({ message: 'Password reset successful.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
