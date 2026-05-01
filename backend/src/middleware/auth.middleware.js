"use strict";

const { query } = require("../config/db");

const authMiddleware = async (req, res, next) => {
  const clerkId = req.header("x-clerk-user-id");
  const clerkUsername = req.header("x-clerk-username");
  const clerkEmail = req.header("x-clerk-user-email");
  
  if (!clerkId) {
    return res.status(401).json({ error: "Unauthorized: Clerk user ID required" });
  }

  try {
    // Check if user exists, create if not, and sync username/email
    let result = await query(
      "SELECT id, clerk_id, username, email FROM users WHERE clerk_id = $1",
      [clerkId]
    );

    let user;
    if (result.rows.length === 0) {
      // Auto-create user with metadata
      result = await query(
        "INSERT INTO users (clerk_id, username, email) VALUES ($1, $2, $3) RETURNING id, clerk_id, username, email",
        [clerkId, clerkUsername || null, clerkEmail || null]
      );
      user = result.rows[0];
    } else {
      user = result.rows[0];
      // Update metadata if it changed or was missing
      if (clerkUsername && user.username !== clerkUsername) {
        await query("UPDATE users SET username = $1, email = $2 WHERE id = $3", [clerkUsername, clerkEmail, user.id]);
        user.username = clerkUsername;
        user.email = clerkEmail;
      }
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = authMiddleware;
