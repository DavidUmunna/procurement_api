const mongoose = require("mongoose");
const PurchaseOrder = require('./models/PurchaseOrder'); // Ensure you require the PurchaseOrder model

// MongoDB connection URI
const mongoURI = "mongodb://localhost:27017/procurement";

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("Connected to MongoDB");

    try {
      await PurchaseOrder.deleteMany({});
      console.log("All orders deleted successfully");
    } catch (error) {
      console.error("Error deleting all orders", error);
    }
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });