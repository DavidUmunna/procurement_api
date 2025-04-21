const mongoose = require("mongoose");
const PurchaseOrder = require('./src/models/PurchaseOrder'); 
//const orders=require("./models/PurchaseOrder")// Ensure you require the PurchaseOrder model
const tasks=require("./src/models/tasks");
const Department = require("./src/models/Department");
// MongoDB connection URI
const mongoURI = "mongodb://127.0.0.1:27017/procurement";

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("Connected to MongoDB");

    try {
      // One-time migration script
          /*await PurchaseOrder.updateMany(
            { "Approvals": { $type: "string" } }, // If old approvals are strings
            [{ $set: { 
                Approvals: { 
                  $map: { 
                    input: "$Approvals", 
                    as: "admin", 
                    in: { 
                      admin: "$$admin", 
                      status: "Approved", // Default status
                      timestamp: new Date() 
                    } 
                  } 
                } 
            }}]
          );*/
          /*await  tasks.deleteMany(
            {"status":"Pending"}

          )*/
         await Department.findOneAndDelete({users:{name:"john"}})
      console.log("All orders migrated  successfully");
    } catch (error) {
      console.error("Error migrating all orders", error);
    }
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });