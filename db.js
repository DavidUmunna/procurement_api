const mongoose = require("mongoose");
const circuitBreaker = require("opossum");
require('dotenv').config({ path: './.env' });

const options = {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 5000,
};

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

const breaker = new circuitBreaker(connectDB, options);

breaker.fallback(() => {
  return { message: "Service is down. Please try again later." };
});

breaker.fire()
  .then(response => console.log("Breaker Response:", response))
  .catch(err => console.error("❌ Circuit breaker triggered:", err.message));

module.exports = connectDB;
