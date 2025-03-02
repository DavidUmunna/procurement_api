
const {Schema, model}=require('mongoose')
const timestamps=require('timestamp')
const PurchaseOrderSchema = new Schema({
  orderNumber: { type: String, required: true, unique: true },
  products: [
    {
      product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true }
    }
  ],
  supplier: { type: Schema.Types.ObjectId, ref: "Supplier", required: true },
  orderedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["pending", "approved", "delivered", "canceled"], default: "pending" }
}, { timestamps: true });
PurchaseOrderSchema.plugin(timestamps);

module.exports= model("PurchaseOrder", PurchaseOrderSchema);
