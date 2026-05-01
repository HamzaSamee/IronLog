const mongoose = require('mongoose');

const connectMongoDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.error('MONGODB_URI not found in .env');
            return;
        }
        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB Atlas (IronLog Videos)');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
    }
};

module.exports = connectMongoDB;
