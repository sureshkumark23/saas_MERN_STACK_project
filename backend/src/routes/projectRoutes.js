const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  createProject,
  getProjectsByWorkspace,
} = require("../controllers/projectController");

const router = express.Router();

// GET projects of a workspace
// /api/workspaces/:workspaceId/projects
router.get(
  "/:workspaceId/projects",
  authMiddleware,
  getProjectsByWorkspace
);

// CREATE project in a workspace
// /api/workspaces/:workspaceId/projects
router.post(
  "/:workspaceId/projects",
  authMiddleware,
  createProject
);

module.exports = router;
