const Activity = require("../models/activity");
const Workspace = require("../models/workspace");

/**
 * GET ACTIVITY FEED FOR A WORKSPACE (with pagination)
 */
const getWorkspaceActivities = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    // ✅ Pagination params
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // ✅ Authorization: only members
    if (!workspace.members.some(m => m.toString() === req.user.userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // ✅ Fetch activities
    const activities = await Activity.find({ workspace: workspaceId })
      .populate("user", "name email")
      .populate("project", "name")
      .populate("task", "title")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // ✅ Total count for pagination
    const totalActivities = await Activity.countDocuments({
      workspace: workspaceId,
    });

    res.status(200).json({
      totalActivities,
      currentPage: page,
      totalPages: Math.ceil(totalActivities / limit),
      activities,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch activity feed" });
  }
};

module.exports = { getWorkspaceActivities };
