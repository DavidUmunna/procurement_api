// test-db.js (or inside your main app file)
const express = require("express");
const router = express.Router();
const User = require("../../models/users_"); // adjust to your model path

router.get("/test-db", async (req, res) => {
  try {
    const user = await User.findOne(); // or use any other test query
    res.status(200).json({
      connected: true,
      message: "Connected to MongoDB Atlas",
      sampleUser: user,
    });
  } catch (error) {
    res.status(500).json({
      connected: false,
      message: "Failed to connect to MongoDB",
      error: error.message,
    });
  }
});

module.exports = router;
