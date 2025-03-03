
const {Schema, model}=require('mongoose')
const timestamps=require('timestamp')
const PurchaseOrderSchema = new Schema({
  orderNumber: { type: String, unique: true, default: () => `PO-${Date.now()}` },
  products: [
    {
      product: { type: String, ref: "Product", required: true },
      quantity: { type: Number, required: true }
    }
  ],
  supplier: { type: String, ref: "Supplier", required: false },
  orderedBy: { type: String,  required: true },
  status: { type: String, enum: ["pending", "approved", "delivered", "canceled"], default: "pending" }
}, { timestamps: true });
PurchaseOrderSchema.plugin(timestamps);
PurchaseOrderSchema.statics.countOrders = async function () {
  return await this.countDocuments();
};

module.exports= model("PurchaseOrder", PurchaseOrderSchema);
