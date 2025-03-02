const { Schema, model } = require('mongoose');

const ProductSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  supplier: { type: Schema.Types.ObjectId, ref: "Supplier", required: true }
}, { timestamps: true });

module.exports = model("Product", ProductSchema);