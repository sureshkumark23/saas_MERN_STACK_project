const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Tenant = require('../models/Tenant');
const authMiddleware = require('../middleware/authMiddleware');


const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new tenant owner and workspace
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, companyName } = req.body;

    // 1. Check if the user already exists
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create the Tenant (Workspace) first
    const newTenant = new Tenant({
      name: companyName || `${name}'s Workspace`,
    });
    const savedTenant = await newTenant.save();

    // 4. Create the User and link them to the Tenant
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: 'owner', // The person registering the workspace is the owner
      tenantId: savedTenant._id
    });
    const savedUser = await newUser.save();

    // 5. Generate a JWT Token
    // You should add a JWT_SECRET to your .env file!
    const payload = {
      user: {
        id: savedUser._id,
        tenantId: savedTenant._id,
        role: savedUser.role
      }
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: '1d' });

    // 6. Send the response
    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: savedUser._id, name: savedUser.name, email: savedUser.email }
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user and get token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 2. Check if the password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 3. Generate a JWT Token
    const payload = {
      user: {
        id: user._id,
        tenantId: user.tenantId,
        role: user.role
      }
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: '1d' });

    // 4. Send the response
    res.status(200).json({
      message: 'Login successful',
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role,
        tenantId: user.tenantId
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});


// @route   GET /api/auth/me
// @desc    Get logged in user details
// @access  Private (Requires Token)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // req.user comes from the middleware! We use .select('-password') so we don't send the hash back.
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});




// @route   PUT /api/auth/profile
// @desc    Update user profile (name, email)
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = name || user.name;
    user.email = email || user.email;
    await user.save();

    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/auth/password
// @desc    Update user password
router.put('/password', authMiddleware, async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Hash the new password before saving it
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error updating password:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;