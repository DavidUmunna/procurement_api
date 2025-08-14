// models/OTP.js
const mongoose = require("mongoose");

const OTPSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  code: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    default: "approval" // could be 'approval', 'password_reset', etc.
  },
  expiresAt: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // auto-delete after 5 minutes (TTL index)
  }
});

module.exports = mongoose.model("OTP", OTPSchema);
