const express = require('express');
const Project = require('../models/project');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;

    const newProject = new Project({
      name,
      description,
      tenantId: req.user.tenantId, // Automatically assigned from the logged-in user's ID card!
      createdBy: req.user.id
    });

    const savedProject = await newProject.save();
    res.status(201).json(savedProject);
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/projects
// @desc    Get all projects for the logged-in user's tenant
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    // SECURITY MAGIC: We only search for projects matching the user's tenantId.
    // They will never see another company's data.
    const projects = await Project.find({ tenantId: req.user.tenantId })
                                  .sort({ createdAt: -1 }); // Newest first
    res.json(projects);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;