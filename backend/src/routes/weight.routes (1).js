"use strict";

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const { query } = require("../config/db");

// GET /api/weight - Fetch weight logs
router.get("/", authMiddleware, async (req, res) => {
    try {
        const result = await query(
            "SELECT * FROM weight_logs WHERE user_id = $1 ORDER BY log_date ASC",
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

// POST /api/weight - Log daily weight
router.post("/", authMiddleware, async (req, res) => {
    const { weight, log_date } = req.body;
    try {
        const result = await query(
            `INSERT INTO weight_logs (user_id, weight, log_date) 
             VALUES ($1, $2, $3) 
             ON CONFLICT (user_id, log_date) DO UPDATE SET weight = $2
             RETURNING *`,
            [req.user.id, weight, log_date || new Date().toISOString().split('T')[0]]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(400).json({ error: "Bad request" });
    }
});

module.exports = router;
