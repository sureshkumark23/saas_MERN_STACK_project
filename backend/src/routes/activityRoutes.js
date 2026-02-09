const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  getWorkspaceActivities,
} = require("../controllers/activityController");

const router = express.Router();

// GET activity feed of a workspace
router.get(
  "/workspaces/:workspaceId/activities",
  authMiddleware,
  getWorkspaceActivities
);

module.exports = router; // 🔥 THIS LINE IS CRITICAL
