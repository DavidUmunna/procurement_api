const mongoose = require("mongoose");
const circuitBreaker = require("opossum");
require('dotenv').config({ path: '../.env' });



const options = {
  timeout: 3000,
  errorthresholdpercentage: 50,
  resettimeout: 5000,
};
const MONGO_URI = process.env.MONGO_URI;
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, ).then(console.log("✅ MongoDB connected successfully")).catch((err) => console.log(err));
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1); // Exit process with failure
  }
};

const breaker = new circuitBreaker(connectDB, options);
breaker.fallback(() => ({ message: "Service is down. Please try again later." }));

breaker.fire().then((response) => console.log(response))
  .catch(err => console.error("circuit breaker triggered", err));



module.exports = connectDB 
