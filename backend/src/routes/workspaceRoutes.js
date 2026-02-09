const express = require("express");
const {
  createWorkspace,
  inviteUser,
  getMyWorkspaces,
  getWorkspaceMembers, // ✅ ADD
} = require("../controllers/workspaceController");
const authMiddleware = require("../middlewares/authMiddleware");
const subscriptionMiddleware = require("../middlewares/subscriptionMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getMyWorkspaces);

router.post(
  "/",
  authMiddleware,
  subscriptionMiddleware("workspace"),
  createWorkspace
);

/**
 * 👥 GET WORKSPACE MEMBERS
 */
router.get(
  "/:workspaceId/members",
  authMiddleware,
  getWorkspaceMembers
);


router.post(
  "/:workspaceId/invite",
  authMiddleware,
  inviteUser
);

module.exports = router;
