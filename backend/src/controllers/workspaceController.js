const Workspace = require("../models/workspace");
const User = require("../models/User");
const Activity = require("../models/activity");
const Notification = require("../models/notification");

/**
 * CREATE WORKSPACE
 */
const createWorkspace = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Workspace name is required" });
    }

    const workspace = await Workspace.create({
      name,
      owner: req.user.userId,
      members: [req.user.userId],
    });

    // ✅ ACTIVITY LOG
    await Activity.create({
      action: "Workspace created",
      user: req.user.userId,
      workspace: workspace._id,
    });

    res.status(201).json(workspace);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * INVITE USER (ONLY OWNER)
 */
const inviteUser = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { email } = req.body;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // ✅ ONLY OWNER CAN INVITE
    if (workspace.owner.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "Only workspace owner can invite users",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (workspace.members.includes(user._id)) {
      return res.status(400).json({ message: "User already a member" });
    }

    workspace.members.push(user._id);
    await workspace.save();

    // ✅ ACTIVITY LOG
    await Activity.create({
      action: `User invited: ${user.email}`,
      user: req.user.userId,
      workspace: workspace._id,
    });

    // ✅ NOTIFICATION FOR INVITED USER
    await Notification.create({
      user: user._id,
      message: `You were invited to workspace "${workspace.name}"`,
      workspace: workspace._id,
    });

    res.status(200).json({ message: "User invited successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET MY WORKSPACES
 */
const getMyWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      members: req.user.userId,
    });

    res.status(200).json(workspaces);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET WORKSPACE MEMBERS
 */
const getWorkspaceMembers = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId).populate(
      "members",
      "name email"
    );

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // only members can view members list
    if (
      !workspace.members.some(
        (m) => m._id.toString() === req.user.userId
      )
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.status(200).json(workspace.members);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createWorkspace,
  inviteUser,
  getMyWorkspaces,
  getWorkspaceMembers,
};
