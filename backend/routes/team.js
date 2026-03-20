const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/team
// @desc    Get all team members in the current workspace (tenant)
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Fetch all users who share the same tenantId as the logged-in user
    // We use .select('-password') to make sure we NEVER send passwords to the frontend
    const teamMembers = await User.find({ tenantId: req.user.tenantId })
                                  .select('-password')
                                  .sort({ createdAt: 1 }); // Oldest first (owner usually at top)
    
    res.json(teamMembers);
  } catch (err) {
    console.error('Error fetching team:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/team/invite
// @desc    Add a new team member to the workspace
// @access  Private (Ideally restricted to 'owner' or 'admin')
router.post('/invite', authMiddleware, async (req, res) => {
  try {
    const { name, email, role } = req.body;

    // 1. Check if user already exists anywhere in the database
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // 2. Create a temporary default password for the invited user
    // In a real production app, you would send them an email with a setup link instead!
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('welcome123', salt);

    // 3. Create the new user and link them to the CURRENT user's tenant
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'member',
      tenantId: req.user.tenantId // This is the magic multi-tenant link!
    });

    const savedUser = await newUser.save();
    
    // Don't send the password hash back
    savedUser.password = undefined; 

    res.status(201).json(savedUser);
  } catch (err) {
    console.error('Error inviting team member:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;