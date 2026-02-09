const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");

const {
  createTask,
  updateTask,
  getTasks,
  deleteTask, // ✅ IMPORTED
} = require("../controllers/taskController");

const router = express.Router();

// CREATE TASK
router.post(
  "/projects/:projectId/tasks",
  authMiddleware,
  createTask
);

// GET TASKS
router.get(
  "/projects/:projectId/tasks",
  authMiddleware,
  getTasks
);

// UPDATE TASK
router.patch(
  "/tasks/:taskId",
  authMiddleware,
  updateTask
);

// DELETE TASK
router.delete(
  "/tasks/:taskId",
  authMiddleware,
  deleteTask
);

module.exports = router;
