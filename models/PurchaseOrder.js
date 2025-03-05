const { Schema, model } = require('mongoose');
const timestamps = require('timestamp');

const PurchaseOrderSchema = new Schema({
  orderNumber: { type: String, unique: true, default: () => `PO-${Date.now()}` },

  products: [
    {
      
        Name: { type: String, required: true }
      ,
      quantity: { type: Number, required: true },
      price:{type:Number,required:true}
    }
  ],  
  supplier: { type: String,  required: false },
  orderedBy: { type: String, required: true },
  status: { type: String, enum: ["Pending", "approved", "delivered", "canceled"], default: "Pending" }
}, { timestamps: true });

PurchaseOrderSchema.plugin(timestamps);

PurchaseOrderSchema.statics.countOrders = async function () {
  return await this.countDocuments();
};

module.exports = model("PurchaseOrder", PurchaseOrderSchema);