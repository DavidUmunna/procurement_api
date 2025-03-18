const mongoose = require("mongoose");
const PurchaseOrder = require('./models/PurchaseOrder'); 
const orders=require("./models/PurchaseOrder")// Ensure you require the PurchaseOrder model

// MongoDB connection URI
const mongoURI = "mongodb://127.0.0.1:27017/procurement";

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("Connected to MongoDB");

    try {
      await orders.deleteMany({});
      console.log("All users deleted successfully");
    } catch (error) {
      console.error("Error deleting all orders", error);
    }
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });