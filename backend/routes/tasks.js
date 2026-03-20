const express = require('express');
const Task = require('../models/Task');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/tasks
// @desc    Create a new task under a specific project
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, projectId, status, assignedTo } = req.body;

    // Validate that a project ID was provided
    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required' });
    }

    const newTask = new Task({
      title,
      description,
      status: status || 'todo',
      projectId,
      assignedTo,
      tenantId: req.user.tenantId // Automatically scoped to the logged-in user's workspace!
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tasks
// @desc    Get tasks (can filter by projectId using query params)
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    // 1. Always enforce tenant isolation
    const query = { tenantId: req.user.tenantId };

    // 2. If the frontend asks for tasks for a specific project (e.g., /api/tasks?projectId=123)
    if (req.query.projectId) {
      query.projectId = req.query.projectId;
    }

    // Fetch the tasks and populate the 'assignedTo' user data so we get their name, not just their ID
    const tasks = await Task.find(query)
                            .populate('assignedTo', 'name email') 
                            .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// @route   PATCH /api/tasks/:id
// @desc    Update a task's status (used for drag and drop)
// @access  Private
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    // We make sure to check the tenantId so users can't modify other companies' tasks!
    // Inside your router.patch('/:id', ...) route:
    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      { $set: { status } },
      { returnDocument: 'after' } // <--- THIS IS THE FIX!
    );

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found or unauthorized' });
    }

    res.json(updatedTask);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// @route   POST /api/tasks/:id/comments
// @desc    Add a comment to a task
// @access  Private

// @route   POST /api/tasks
router.post('/', authMiddleware, async (req, res) => {
  try {
    // Add priority here vvv
    const { title, description, projectId, status, priority, assignedTo } = req.body;

    if (!projectId) return res.status(400).json({ message: 'Project ID is required' });

    const newTask = new Task({
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium', // Add priority here vvv
      projectId,
      assignedTo,
      tenantId: req.user.tenantId
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;