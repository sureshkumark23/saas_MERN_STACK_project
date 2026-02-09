const Project = require("../models/project");
const Workspace = require("../models/workspace");
const Activity = require("../models/activity");

/**
 * CREATE PROJECT
 */
const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const { workspaceId } = req.params;

    if (!name) {
      return res.status(400).json({ message: "Project name is required" });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    if (!workspace.members.includes(req.user.userId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const project = await Project.create({
      name,
      description,
      workspace: workspaceId,
      createdBy: req.user.userId,
    });

    // ✅ ACTIVITY LOG
    await Activity.create({
      action: "Project created",
      user: req.user.userId,
      workspace: workspace._id,
      project: project._id,
    });

    res.status(201).json({
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET PROJECTS BY WORKSPACE
 */
const getProjectsByWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    if (!workspace.members.includes(req.user.userId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const projects = await Project.find({ workspace: workspaceId });
    res.status(200).json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createProject, getProjectsByWorkspace };
