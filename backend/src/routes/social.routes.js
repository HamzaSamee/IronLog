"use strict";

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const { query } = require("../config/db");

// --- Friendships ---

// GET /api/social/friends - List all friends
router.get("/friends", authMiddleware, async (req, res) => {
    try {
        const result = await query(`
            SELECT u.id, u.username, u.clerk_id
            FROM users u
            JOIN friendships f ON (u.id = f.user_id_1 OR u.id = f.user_id_2)
            WHERE (f.user_id_1 = $1 OR f.user_id_2 = $1) AND u.id != $1
        `, [req.user.id]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

// POST /api/social/friends/:id - Add a friend
router.post("/friends/:friendId", authMiddleware, async (req, res) => {
    const { friendId } = req.params;
    try {
        const result = await query(
            "INSERT INTO friendships (user_id_1, user_id_2) VALUES ($1, $2) RETURNING *",
            [Math.min(req.user.id, friendId), Math.max(req.user.id, friendId)]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(400).json({ error: "Friendship already exists or invalid user" });
    }
});

// --- Messaging ---

// GET /api/social/messages/:friendId - Get conversation with a friend
router.get("/messages/:friendId", authMiddleware, async (req, res) => {
    const { friendId } = req.params;
    try {
        const result = await query(`
            SELECT m.*, u.username as sender_name
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE (sender_id = $1 AND receiver_id = $2)
               OR (sender_id = $2 AND receiver_id = $1)
            ORDER BY sent_at ASC
        `, [req.user.id, friendId]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

// POST /api/social/messages - Send a message
router.post("/messages", authMiddleware, async (req, res) => {
    const { receiver_id, content } = req.body;
    try {
        const result = await query(
            "INSERT INTO messages (sender_id, receiver_id, message_text) VALUES ($1, $2, $3) RETURNING *",
            [req.user.id, receiver_id, content]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(400).json({ error: "Bad request" });
    }
});

module.exports = router;
