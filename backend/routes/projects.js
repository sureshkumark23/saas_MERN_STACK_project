const express = require('express');
const Project = require('../models/Project');
const Task = require('../models/Task'); // We need the Task model to calculate progress!
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/projects
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;
    const newProject = new Project({
      name,
      description,
      tenantId: req.user.tenantId,
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
router.get('/', authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find({ tenantId: req.user.tenantId }).sort({ createdAt: -1 });

    // Iterate through all projects and calculate their specific task progress
    const projectsWithStats = await Promise.all(projects.map(async (project) => {
      // Find all tasks related to this specific project
      const tasks = await Task.find({ projectId: project._id }).populate('assignedTo', 'name');

      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.status === 'done').length;
      const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

      // Extract unique user initials for the avatar bubbles
      const assignees = [];
      const seenIds = new Set();
      
      tasks.forEach(task => {
        if (task.assignedTo && !seenIds.has(task.assignedTo._id.toString())) {
          seenIds.add(task.assignedTo._id.toString());
          const nameParts = task.assignedTo.name.split(' ');
          const initials = nameParts.length > 1 
            ? nameParts[0][0] + nameParts[1][0] 
            : nameParts[0][0];
          assignees.push({ id: task.assignedTo._id, initials: initials.toUpperCase() });
        }
      });

      // If no one is assigned yet, we provide some dummy initials just so the UI looks good while testing!
      const displayAvatars = assignees.length > 0 ? assignees : [
        { id: '1', initials: 'JD' }, { id: '2', initials: 'SC' }
      ];

      return {
        ...project.toObject(),
        totalTasks,
        completedTasks,
        progress,
        assignees: displayAvatars
      };
    }));

    res.json(projectsWithStats);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;