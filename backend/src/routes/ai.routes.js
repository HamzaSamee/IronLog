"use strict";

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const { query } = require("../config/db");
const { Groq } = require("groq-sdk");

// Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

router.get("/ping", (req, res) => {
  res.json({ 
    message: "AI ROUTE ACTIVE (GROQ)", 
    apiKeySet: !!process.env.GROQ_API_KEY,
    model: "llama-3.3-70b-versatile"
  });
});

router.post("/chat", authMiddleware, async (req, res) => {
  const { message } = req.body;

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ 
      error: "AI NOT CONFIGURED", 
      message: "Please set GROQ_API_KEY in your .env file to enable the Iron Coach." 
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

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: message
          }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 1,
        stream: false,
      });

      const reply = chatCompletion.choices[0]?.message?.content || "The Iron Coach is speechless. Try again.";
      res.json({ reply });

    } catch (err) {
      console.error(`❌ Groq AI Error:`, err.message);
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
