const mongoose = require("mongoose");
require("dotenv").config();
URI="mongodb+srv://chimaumunna98:Chimaroke135@unique.xxejy.mongodb.net/?retryWrites=true&w=majority&appName=Unique"

const MONGO_URI = process.env.MONGO_URI ||"mongodb://127.0.0.1:27017/procurement" ;
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
