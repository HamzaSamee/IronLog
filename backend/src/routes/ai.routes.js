"use strict";

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const { query } = require("../config/db");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

router.get("/ping", (req, res) => {
  res.json({ 
    message: "AI ROUTE ACTIVE", 
    apiKeySet: !!process.env.GEMINI_API_KEY,
    keyLength: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0,
    model: "gemini-pro"
  });
});

router.post("/chat", authMiddleware, async (req, res) => {
  const { message } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ 
      error: "AI NOT CONFIGURED", 
      message: "Please set GEMINI_API_KEY in your .env file to enable the Iron Coach." 
    });
  }

  try {
    // 1. Fetch User Context (Recent logs and goals)
    const logsResult = await query(
      "SELECT activity_name, intensity, start_time FROM activity_logs WHERE user_id = $1 ORDER BY start_time DESC LIMIT 10",
      [req.user.id]
    );

    const goalsResult = await query(
      "SELECT title, description, completed FROM goals WHERE user_id = $1 AND completed = false",
      [req.user.id]
    );

    const userContext = {
      recentLogs: logsResult.rows,
      activeGoals: goalsResult.rows,
    };

    // 2. Prepare System Prompt
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const systemPrompt = `
        You are "Iron Intelligence" (II), the elite AI fitness coach for the IronLog platform. 
        Your personality: Highly motivating, slightly intense, expert-level knowledge in hypertrophy, strength training, and productivity. 
        You use terms like "Optimal," "High Intensity," "Consistency," and "Data-Driven."
        
        User's Recent Data:
        ${JSON.stringify(userContext)}
        
        Instructions:
        - Use the user's recent logs and goals to give personalized advice.
        - If they haven't logged much, push them to start.
        - Keep responses concise but powerful.
        - Format with markdown (bolding, lists).
      `;

      const chat = model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: systemPrompt }],
          },
          {
            role: "model",
            parts: [{ text: "UNDERSTOOD. IRON INTELLIGENCE ONLINE. STANDING BY FOR PERFORMANCE OPTIMIZATION." }],
          },
        ],
      });

      const result = await chat.sendMessage(message);
      const response = await result.response;
      const text = response.text();
      res.json({ reply: text });

    } catch (err) {
      console.error(`❌ AI Error:`, err.message);
      res.status(500).json({ error: "AI Coach is temporarily unavailable." });
    }
  } catch (error) {
    console.error("DETAILED AI ERROR:", error);
    res.status(500).json({ 
      error: "COACH_OFFLINE", 
      message: error.message || "The Iron Coach is currently unavailable." 
    });
  }
});

module.exports = router;
