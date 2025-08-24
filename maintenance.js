const mongoose = require("mongoose");

//const orders=require("./models/PurchaseOrder")// Ensure you require the PurchaseOrder model

const Activity=require("./models/Activity")
// MongoDB connection URI
const mongoURI = "mongodb://127.0.0.1:27017/procurement";

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    

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
         //await InventoryItem.deleteMany()
         const new_doc=await Activity.deleteMany()

         await new_doc.save()
     
    } catch (error) {
      console.error("Error migrating all orders", error);
    }
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });