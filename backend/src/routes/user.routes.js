"use strict";

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const { query } = require("../config/db");

// GET /api/users/me - Current user profile
router.get("/me", authMiddleware, async (req, res) => {
    res.json(req.user);
});

// GET /api/users - List all users (for discovery/friends)
router.get("/", authMiddleware, async (req, res) => {
    try {
        const result = await query(
            "SELECT id, username, clerk_id, goal_type FROM users WHERE id != $1",
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

// GET /api/users/leaderboard - Leaderboard based on activity consistency
router.get("/leaderboard", authMiddleware, async (req, res) => {
    try {
        const result = await query(`
            SELECT u.id, u.username, COUNT(a.id) as activity_count
            FROM users u
            LEFT JOIN activity_logs a ON u.id = a.user_id
            GROUP BY u.id
            ORDER BY activity_count DESC
            LIMIT 10
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

// PATCH /api/users/goal - Update user fitness goal
router.patch("/goal", authMiddleware, async (req, res) => {
    const { goal_type, target_weight, daily_caloric_target } = req.body;
    try {
        const result = await query(
            "UPDATE users SET goal_type = $1, target_weight = $2, daily_caloric_target = $3 WHERE id = $4 RETURNING *",
            [goal_type, target_weight, daily_caloric_target, req.user.id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(400).json({ error: "Bad request" });
    }
});

module.exports = router;
