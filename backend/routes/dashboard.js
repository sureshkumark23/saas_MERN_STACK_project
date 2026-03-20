const express = require('express');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/dashboard/stats
// @route   GET /api/dashboard/stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    // We added a new query here to count specifically the 'done' tasks
    const [projectCount, taskCount, completedTaskCount, teamCount, recentTasks, activeProjectsRaw] = await Promise.all([
      Project.countDocuments({ tenantId }),
      Task.countDocuments({ tenantId }),
      Task.countDocuments({ tenantId, status: 'done' }), // NEW
      User.countDocuments({ tenantId }),
      Task.find({ tenantId }).sort({ createdAt: -1 }).limit(5).populate('projectId', 'name').populate('assignedTo', 'name'),
      Project.find({ tenantId, status: { $ne: 'completed' } }).sort({ createdAt: -1 }).limit(3)
    ]);

    // Calculate overall completion rate
    const completionRate = taskCount === 0 ? 0 : Math.round((completedTaskCount / taskCount) * 100);

    // Calculate the progress for the active projects
    const activeProjects = await Promise.all(activeProjectsRaw.map(async (project) => {
      const tasks = await Task.find({ projectId: project._id });
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.status === 'done').length;
      const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
      
      return { ...project.toObject(), totalTasks, completedTasks, progress };
    }));

    res.json({
      projectCount,
      taskCount,
      teamCount,
      completionRate, // Send the new rate to the frontend
      recentTasks,
      activeProjects
    });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;