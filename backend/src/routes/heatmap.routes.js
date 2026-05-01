"use strict";

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const { query } = require("../config/db");

// GET /api/heatmap - Daily avg intensity heatmap data
router.get("/", authMiddleware, async (req, res) => {
  const days = req.query.days || 365; // Default 1 year
  try {
    const result = await query(
      `SELECT 
         DATE(start_time) as date,
         AVG(intensity) as avg_intensity,
         COUNT(*) as log_count
       FROM activity_logs 
       WHERE user_id = $1 
         AND start_time >= NOW() - INTERVAL '${days} days'
         AND intensity IS NOT NULL
       GROUP BY DATE(start_time)
       ORDER BY date DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Heatmap query error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
