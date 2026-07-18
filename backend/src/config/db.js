const mongoose = require('mongoose');
const config = require('./env');

/**
 * Separated from app.js on purpose: app.js builds the Express app (used
 * directly in tests without a real DB connection); connectDB() is only
 * invoked by server.js when actually booting the service.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri);
    console.log(`[db] MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`[db] MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
