const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    youtube_id: { type: String, required: true },
    thumbnail_url: { type: String },
    category: { type: String, default: 'General' },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Video', videoSchema);
