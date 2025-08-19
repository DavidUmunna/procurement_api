// models/Signature.js
const mongoose = require("mongoose");

const signatureSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  SignatureData: { type: String, required: true }, 
  // stores base64 string like "data:image/png;base64,iVBORw0KGgo..."
  
  // Optional metadata
 
  device: { type: String }, // e.g., "touchscreen", "mouse"
  ipAddress: { type: String }, // user’s IP when signing
  

},{timestamps:true});

module.exports = mongoose.model("signatures", signatureSchema);
