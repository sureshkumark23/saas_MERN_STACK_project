const express = require('express');
const jwt = require('jsonwebtoken'); 
const Tenant = require('../models/Tenant');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// @route   GET /api/workspaces
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('workspaces');
    if (!user.workspaces || user.workspaces.length === 0) {
       const currentTenant = await Tenant.findById(user.tenantId);
       return res.json([currentTenant]);
    }
    res.json(user.workspaces);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/workspaces
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    
    const newTenant = new Tenant({ name });
    const savedTenant = await newTenant.save();

    const user = await User.findById(req.user.id);
    if (!user.workspaces) user.workspaces = [user.tenantId]; 
    
    user.workspaces.push(savedTenant._id);
    user.tenantId = savedTenant._id; 
    await user.save();

    // FIXED: Wrapped payload inside 'user' object
    const token = jwt.sign(
      { user: { id: user._id, tenantId: user.tenantId, role: user.role } },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '30d' }
    );

    res.status(201).json({ workspace: savedTenant, token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/workspaces/switch/:id
router.put('/switch/:id', authMiddleware, async (req, res) => {
  try {
    const workspaceId = req.params.id;
    const user = await User.findById(req.user.id);

    user.tenantId = workspaceId;
    await user.save();

    // FIXED: Wrapped payload inside 'user' object
    const token = jwt.sign(
      { user: { id: user._id, tenantId: user.tenantId, role: user.role } },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '30d' }
    );

    res.json({ message: 'Switched workspace successfully', token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;