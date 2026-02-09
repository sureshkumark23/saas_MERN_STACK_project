const Task = require("../models/task");
const Project = require("../models/project");
const Workspace = require("../models/workspace");
const Activity = require("../models/activity");
const Notification = require("../models/notification");

/**
 * CREATE TASK
 */
const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, priority, assignedTo } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Task title required" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const workspace = await Workspace.findById(project.workspace);
    if (!workspace.members.includes(req.user.userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const task = await Task.create({
      title,
      priority,
      project: projectId,
      assignedTo: assignedTo || null,
      createdBy: req.user.userId,
    });

    // ✅ ACTIVITY LOG
    await Activity.create({
      action: "Task created",
      user: req.user.userId,
      workspace: workspace._id,
      project: project._id,
      task: task._id,
    });

    // ✅ NOTIFICATION (TASK ASSIGNED)
    if (assignedTo) {
      await Notification.create({
        user: assignedTo,
        message: `You were assigned a task: "${task.title}"`,
        workspace: workspace._id,
        project: project._id,
        task: task._id,
      });
    }

    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET TASKS
 */
const getTasks = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    const workspace = await Workspace.findById(project.workspace);

    if (!workspace.members.includes(req.user.userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const tasks = await Task.find({ project: projectId });
    res.json({ tasks });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * UPDATE TASK STATUS
 */
const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const project = await Project.findById(task.project);
    const workspace = await Workspace.findById(project.workspace);

    if (!workspace.members.includes(req.user.userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const validFlow = {
      todo: ["in-progress"],
      "in-progress": ["completed"],
      completed: [],
    };

    if (!validFlow[task.status].includes(status)) {
      return res.status(400).json({ message: "Invalid status transition" });
    }

    task.status = status;
    await task.save();

    // ✅ ACTIVITY LOG
    await Activity.create({
      action: `Task status changed to ${status}`,
      user: req.user.userId,
      workspace: workspace._id,
      project: project._id,
      task: task._id,
    });

    // ✅ NOTIFICATION TO ASSIGNEE
    if (task.assignedTo) {
      await Notification.create({
        user: task.assignedTo,
        message: `Task "${task.title}" moved to ${status}`,
        workspace: workspace._id,
        project: project._id,
        task: task._id,
      });
    }

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * DELETE TASK — OWNER ONLY
 */
const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const project = await Project.findById(task.project);
    const workspace = await Workspace.findById(project.workspace);

    if (workspace.owner.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "Only workspace owner can delete tasks",
      });
    }

    await task.deleteOne();

    // ✅ ACTIVITY LOG
    await Activity.create({
      action: "Task deleted",
      user: req.user.userId,
      workspace: workspace._id,
      project: project._id,
      task: task._id,
    });

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createTask,
  updateTask,
  getTasks,
  deleteTask,
};
