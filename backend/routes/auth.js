const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Email Transporter for Password Resets
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'This email is already registered. Please log in.' });
    }

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create the user
    user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'owner' // First time registering, they own their first workspace
    });

    await user.save();

    // 4. Generate Token
    const payload = { user: { id: user._id, tenantId: user.tenantId, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: '30d' });

    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

    const payload = { user: { id: user._id, tenantId: user.tenantId, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: '30d' });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, tenantId: user.tenantId } });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'No account with that email found.' });
    }

    // Generate a random reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Save token and set expiration to 1 hour from now
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 3600000; 
    await user.save();

    // Create reset URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const mailOptions = {
      from: `"Acme Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <h3>You requested a password reset</h3>
        <p>Click the link below to securely reset your password. This link is valid for 1 hour.</p>
        <a href="${resetUrl}" style="background-color: #3b66f5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Password reset email sent!' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Email could not be sent' });
  }
});

// @route   PUT /api/auth/reset-password/:token
// @desc    Reset password using token
router.put('/reset-password/:token', async (req, res) => {
  try {
    // Hash the token from the URL to match the one saved in the database
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() } // Ensure token hasn't expired
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash the new password and save
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    
    // Clear the reset tokens
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: 'Password reset successful! You can now log in.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ... YOUR EXISTING PROFILE AND PASSWORD PUT ROUTES GO HERE ...
router.put('/profile', authMiddleware, async (req, res) => { /* existing logic */ });
router.put('/password', authMiddleware, async (req, res) => { /* existing logic */ });

module.exports = router;