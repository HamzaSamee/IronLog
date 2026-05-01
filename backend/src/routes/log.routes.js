"use strict";

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const { query } = require("../config/db");

// GET /api/logs - Fetch user logs
router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await query(
      "SELECT * FROM activity_logs WHERE user_id = $1 ORDER BY start_time DESC",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Fetch logs error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/logs - Log activity
router.post("/", authMiddleware, async (req, res) => {
  const { activity_name, description, start_time, end_time, intensity } = req.body;
  try {
    const result = await query(
      `INSERT INTO activity_logs (user_id, activity_name, description, start_time, end_time, intensity) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.id, activity_name, description || null, start_time || new Date().toISOString(), end_time || null, intensity || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create log error:", error);
    res.status(400).json({ error: "Bad request" });
  }
});

// PATCH /api/logs/:id - Update intensity
router.patch("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { intensity } = req.body;
  if (!intensity || intensity < 1 || intensity > 10) {
    return res.status(400).json({ error: "Intensity must be 1-10" });
  }
  try {
    const result = await query(
      "UPDATE activity_logs SET intensity = $1 WHERE id = $2 AND user_id = $3 RETURNING *",
      [intensity, id, req.user.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Log not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Update log error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
