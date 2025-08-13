const {ValidatePendingApprovals} =require("../controllers/RequestController")
const PurchaseOrder=require("../models/PurchaseOrder")
const mongoose=require("mongoose")
const migratePendingApprovalsStructure = async () => {
  try {
    console.log("Starting PendingApprovals migration...");

    // Find requests with:
    // - Missing PendingApprovals
    // - Empty PendingApprovals
    // - Wrong structure (e.g., first element doesn't have Reviewer and Level)
    const requestsToUpdate = await PurchaseOrder.find({
      $or: [
        { PendingApprovals: { $exists: false } },
        { PendingApprovals: { $size: 0 } },
        { "PendingApprovals.0.Reviewer": { $exists: false } },
        { "PendingApprovals.0.Level": { $exists: false } }
      ]
    }).select("_id");

    console.log(`Found ${requestsToUpdate.length} requests to update.`);

    for (const request of requestsToUpdate) {
      console.log(`Updating request: ${request._id}`);
      await ValidatePendingApprovals(request._id);
    }

    console.log("Migration completed!");
  } catch (error) {
    console.error("Error during PendingApprovals migration:", error);
  }
};

(async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/Haldenresources", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log("Connected to MongoDB");
    await migratePendingApprovalsStructure();
  } catch (err) {
    console.error("Migration failed", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
})();
