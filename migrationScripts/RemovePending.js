const mongoose = require("mongoose");
const PurchaseOrder = require("../models/PurchaseOrder"); // adjust path

async function removeApprovalsWithMatchingRoles() {
  try {
    await mongoose.connect("mongodb://localhost:27017/Haldenresources");

    const orders = await PurchaseOrder.find()
      .populate("staff")
      .populate("PendingApprovals.Reviewer")
    
    console.log(`Found ${orders.length} orders to check`);

    for (const order of orders) {
      const approvalRoles = (order.Approvals || [])
        .map(a => a.role)
        .filter(Boolean); // remove null/undefined

      const originalCount = order.PendingApprovals.length;

      order.PendingApprovals = order.PendingApprovals.filter(
        pa => !approvalRoles.includes(pa.Reviewer?.role)
      );

      if (order.PendingApprovals.length !== originalCount) {
        await order.save();
        console.log(`Updated order ${order._id}`);
      }
    }

    mongoose.disconnect();
    console.log("✅ Removed PendingApprovals where role already in Approvals");
  } catch (err) {
    console.error("❌ Error updating orders:", err);
    mongoose.disconnect();
  }
}


removeApprovalsWithMatchingRoles();
