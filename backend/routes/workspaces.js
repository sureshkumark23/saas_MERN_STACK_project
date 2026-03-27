const express = require('express');
const jwt = require('jsonwebtoken'); 
const Tenant = require('../models/Tenant');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
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

// @route   DELETE /api/workspaces/:id
// @desc    Delete a workspace (OWNER ONLY)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const workspaceId = req.params.id;
    const user = await User.findById(req.user.id);

    // 1. Strict Owner Check
    if (req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Unauthorized. Only the workspace owner can delete it.' });
    }

    // 2. Prevent deleting their only workspace
    if (!user.workspaces || user.workspaces.length <= 1) {
      return res.status(400).json({ message: 'You cannot delete your only workspace. Please create another one first.' });
    }

    // 3. Move user to safe workspace FIRST before deleting
    if (user.tenantId.toString() === workspaceId) {
      const safeWorkspace = user.workspaces.find(id => id.toString() !== workspaceId);
      user.tenantId = safeWorkspace;
      await user.save();
    }

    // ==========================================
    // 4. THE CASCADING DELETE 🧹
    // ==========================================
    // Find all projects that belong to this workspace
    const workspaceProjects = await Project.find({ tenantId: workspaceId });
    const projectIds = workspaceProjects.map(p => p._id);

    // Delete ALL tasks that are linked to those projects
    if (projectIds.length > 0) {
      await Task.deleteMany({ projectId: { $in: projectIds } });
    }

    // Delete ALL projects in this workspace
    await Project.deleteMany({ tenantId: workspaceId });
    // ==========================================

    // 5. Delete the Workspace document itself
    await Tenant.findByIdAndDelete(workspaceId);

    // 6. Remove the deleted workspace ID from ALL users' accounts
    await User.updateMany(
      { workspaces: workspaceId },
      { $pull: { workspaces: workspaceId } }
    );

    res.json({ message: 'Workspace and all associated data deleted successfully' });
  } catch (err) {
    console.error("Delete Workspace Error:", err);
    res.status(500).json({ message: 'Server error while deleting workspace' });
  }
});
// @route   PUT /api/workspaces/:id
// @desc    Rename a workspace (OWNER ONLY)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Unauthorized. Only the workspace owner can rename it.' });
    }

    const { name } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Workspace name is required.' });
    }

    const updatedWorkspace = await Tenant.findByIdAndUpdate(
      req.params.id,
      { name: name.trim() },
      { returnDocument: 'after' }
    );

    res.json({ message: 'Workspace renamed successfully', workspace: updatedWorkspace });
  } catch (err) {
    console.error("Rename Workspace Error:", err);
    res.status(500).json({ message: 'Server error while renaming workspace' });
  }
});

module.exports = router;