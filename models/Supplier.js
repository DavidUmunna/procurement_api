const { Schema, model } = require("mongoose");
const timestamps=require('timestamp')
const SupplierSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: { type: String },
  status: { type: String, enum: ["active", "inactive"], default: "active" }
}, { timestamps: true });

SupplierSchema.plugin(timestamps);
module.exports = model("Supplier", SupplierSchema);