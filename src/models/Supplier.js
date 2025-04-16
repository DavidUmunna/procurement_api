const { Schema, model, default: mongoose } = require("mongoose");
const timestamps=require('timestamp')
const SupplierSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  requests:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"PurchaseOrder"

  }
}, { timestamps: true });

SupplierSchema.plugin(timestamps);
module.exports = model("Supplier", SupplierSchema);