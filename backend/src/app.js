const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const workspaceRoutes = require("./routes/workspaceRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const activityRoutes = require("./routes/activityRoutes"); 
const notificationRoutes = require("./routes/notificationRoutes");


const app = express();

// ✅ Parse JSON FIRST
app.use(express.json());

// ✅ Enable CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ✅ ROUTES
app.use("/api/auth", authRoutes);

// workspaces
app.use("/api/workspaces", workspaceRoutes);

// projects under workspaces
app.use("/api/workspaces", projectRoutes);

// tasks
app.use("/api", taskRoutes);

// activities
app.use("/api", activityRoutes); // ✅ must be router

app.use("/api", notificationRoutes);

module.exports = app;
