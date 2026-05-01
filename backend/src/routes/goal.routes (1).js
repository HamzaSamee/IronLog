"use strict";

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const { query } = require("../config/db");

// GET /api/goals - List user's goals
router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await query(
      "SELECT * FROM goals WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Get goals error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/goals - Create goal
router.post("/", authMiddleware, async (req, res) => {
  const { title, description, priority, deadline } = req.body;
  try {
    const result = await query(
      "INSERT INTO goals (user_id, title, description, priority, deadline) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [req.user.id, title, description || null, priority || 1, deadline || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create goal error:", error);
    res.status(400).json({ error: "Bad request" });
  }
});

// PATCH /api/goals/:id - Update goal
router.patch("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const fields = [];
  const values = [];
  let paramIndex = 1;
  Object.keys(updates).forEach(key => {
    fields.push(`${key} = $${paramIndex}`);
    values.push(updates[key]);
    paramIndex++;
  });
  
  const idIndex = paramIndex;
  const userIdIndex = paramIndex + 1;
  values.push(id, req.user.id);

  try {
    const result = await query(
      `UPDATE goals SET ${fields.join(", ")} WHERE id = $${idIndex} AND user_id = $${userIdIndex} RETURNING *`,
      values
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Goal not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Update goal error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/goals/:id
router.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query(
      "DELETE FROM goals WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, req.user.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Goal not found" });
    }
    res.json({ message: "Goal deleted" });
  } catch (error) {
    console.error("Delete goal error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
