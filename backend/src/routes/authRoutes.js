const express = require("express");
const { signup, login } = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();

// public routes
router.post("/signup", signup);
router.post("/login", login);

// protected admin-only route
router.get(
  "/admin-only",
  authMiddleware,
  roleMiddleware("admin"),
  (req, res) => {
    res.json({ message: "Admin access granted" });
  }
);

// protected user profile route
router.get("/profile", authMiddleware, (req, res) => {
  res.json({
    message: "Protected route accessed",
    user: req.user,
  });
});

module.exports = router;
