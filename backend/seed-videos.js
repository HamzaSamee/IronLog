const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Video = require('./src/models/video.model');

const seedVideos = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error('MONGODB_URI not found');

        await mongoose.connect(uri);
        console.log('Connected to MongoDB Atlas');

        // Clear existing videos
        await Video.deleteMany({});
        console.log('Cleared existing videos');

        const starterVideos = [
            {
                title: "Complete Full Body Workout",
                youtube_id: "rZ_Z4Y0J8-w",
                thumbnail_url: "https://img.youtube.com/vi/rZ_Z4Y0J8-w/maxresdefault.jpg",
                category: "Full Body"
            },
            {
                title: "Perfect Pull Up Form",
                youtube_id: "eGo4IYlbE5g",
                thumbnail_url: "https://img.youtube.com/vi/eGo4IYlbE5g/maxresdefault.jpg",
                category: "Upper Body"
            },
            {
                title: "10 Min Abs Workout",
                youtube_id: "AnYl6Nk9GOA",
                thumbnail_url: "https://img.youtube.com/vi/AnYl6Nk9GOA/maxresdefault.jpg",
                category: "Core"
            },
            {
                title: "How to Squat Properly",
                youtube_id: "gcNh17Ckjgg",
                thumbnail_url: "https://img.youtube.com/vi/gcNh17Ckjgg/maxresdefault.jpg",
                category: "Legs"
            },
            {
                title: "Deadlift for Beginners",
                youtube_id: "op9kVnSso6Q",
                thumbnail_url: "https://img.youtube.com/vi/op9kVnSso6Q/maxresdefault.jpg",
                category: "Back"
            },
            {
                title: "Push Ups 101",
                youtube_id: "X7GvXo11F80",
                thumbnail_url: "https://img.youtube.com/vi/X7GvXo11F80/maxresdefault.jpg",
                category: "Chest"
            },
            {
                title: "High Intensity Interval Training",
                youtube_id: "ml6cT4AZdqI",
                thumbnail_url: "https://img.youtube.com/vi/ml6cT4AZdqI/maxresdefault.jpg",
                category: "HIIT"
            },
            {
                title: "Stretching for Flexibility",
                youtube_id: "L_xrDAtykMI",
                thumbnail_url: "https://img.youtube.com/vi/L_xrDAtykMI/maxresdefault.jpg",
                category: "Recovery"
            },
            {
                title: "Meal Prep for Muscle Gain",
                youtube_id: "968Xk5z5SgM",
                thumbnail_url: "https://img.youtube.com/vi/968Xk5z5SgM/maxresdefault.jpg",
                category: "Nutrition"
            },
            {
                title: "Scientific Leg Training",
                youtube_id: "C_W_m9P4H4Y",
                thumbnail_url: "https://img.youtube.com/vi/C_W_m9P4H4Y/maxresdefault.jpg",
                category: "Legs"
            }
        ];

        await Video.insertMany(starterVideos);
        console.log('✅ Successfully seeded 10 videos to MongoDB Atlas!');
    } catch (error) {
        console.error('❌ Seeding Error:', error);
    } finally {
        await mongoose.connection.close();
    }
};

seedVideos();
