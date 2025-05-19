const mongoose = require("mongoose");
const circuitBreaker = require("opossum");
require('dotenv').config({ path: './.env' });



const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    throw error;
  }
};

module.exports = connectDB;
