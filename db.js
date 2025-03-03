const mongoose = require("mongoose");
require("dotenv").config();


const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/procurement";
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).then(console.log("✅ MongoDB connected successfully")).catch((err)=>console.log(err))
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
