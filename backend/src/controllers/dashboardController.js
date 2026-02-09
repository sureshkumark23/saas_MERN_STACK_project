const Task = require("../models/task");
const Project = require("../models/project");

const getDashboardStats = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    // find projects in workspace
    const projects = await Project.find({ workspace: workspaceId }).select("_id");
    const projectIds = projects.map(p => p._id);

    const stats = await Task.aggregate([
      {
        $match: {
          project: { $in: projectIds },
        },
      },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
            },
          },
          pendingTasks: {
            $sum: {
              $cond: [{ $ne: ["$status", "completed"] }, 1, 0],
            },
          },
        },
      },
    ]);

    res.status(200).json(stats[0] || {});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getDashboardStats };
