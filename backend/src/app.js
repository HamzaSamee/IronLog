"use strict";

const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/user.routes");
const logRoutes = require("./routes/log.routes");
const videoRoutes = require("./routes/video.routes");
const goalRoutes = require("./routes/goal.routes");
const heatmapRoutes = require("./routes/heatmap.routes");
const aiRoutes = require("./routes/ai.routes");
const weightRoutes = require("./routes/weight.routes");
const socialRoutes = require("./routes/social.routes");
const nutritionRoutes = require("./routes/nutrition.routes");
const router = express.Router();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));

// Routes with auth
app.use("/api/users", userRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/heatmap", heatmapRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/weight", weightRoutes);
app.use("/api/social", socialRoutes);
app.use("/api/nutrition", nutritionRoutes);

// Health check
app.get("/health", (req, res) => res.status(200).json({ status: "OK" }));

module.exports = app;
