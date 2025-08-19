// models/DisbursementSchedule.js

const mongoose = require("mongoose");

const disbursementScheduleSchema = new mongoose.Schema({
  name:{type:String},
  createdBy: { type: String, required: true }, // Accounts personnel name or ID
  totalAmount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["Draft", "Submitted to MD", "Reviewed by MD", "Approved For Funding", "Funded"],
    default: "Draft",
  },
  requests: [
    {
      requestId: { type: mongoose.Schema.Types.ObjectId, ref: "PurchaseOrder" },
      included: { type: Boolean, default: true }, // false if MD removed it
    },
  ],
  paymentDetails:[
        {type:mongoose.Schema.Types.ObjectId,ref:"paymentdetails"}
      ],
  AccountsComment:{type:String},
  mdComments: { type: String }, // optional comment by MD
  reviewedByMDAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("DisbursementSchedule", disbursementScheduleSchema);
