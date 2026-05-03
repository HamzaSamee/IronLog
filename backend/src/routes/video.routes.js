"use strict";

const express = require("express");
const router = express.Router();
const Video = require("../models/video.model");

// GET /api/videos - Fetch all shared videos from MongoDB
router.get("/", async (req, res) => {
  try {
    const videos = await Video.find().sort({ created_at: -1 });
    res.json(videos);
  } catch (error) {
    console.error("Fetch videos error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/videos - Add a shared video (Admin logic omitted for simplicity)
router.post("/", async (req, res) => {
  const { title, youtube_id, thumbnail_url, category } = req.body;
  try {
    const newVideo = new Video({
      title,
      youtube_id,
      thumbnail_url,
      category
    });
    await newVideo.save();
    res.status(201).json(newVideo);
  } catch (error) {
    console.error("Create video error:", error);
    res.status(400).json({ error: "Bad request" });
  }
});

module.exports = router;
