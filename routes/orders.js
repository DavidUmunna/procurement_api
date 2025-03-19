const { Router } = require("express");
const mongoose = require("mongoose");
const PurchaseOrder = require("../models/PurchaseOrder");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../uploads");

const router = Router();


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });


// Get all purchase orders
router.get("/", async (req, res) => {
  try {
    const orders = await PurchaseOrder.find()
      .populate("supplier", "name email phone")
      .populate("products", "name quantity price")
      

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.get("/:email", async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Fetch user orders
    const userRequests = await PurchaseOrder.find({ email });

    if (!userRequests.length) {
      return res.status(404).json({ message: "No orders found for this email" });
    }

    res.status(200).json(userRequests);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ error: "Failed to retrieve orders" });
  }
});


// Create a new purchase order
router.post("/", upload.array("files"), async (req, res) => {
  try {
    const { supplier, orderedBy, products, email, urgency, remarks } = req.body;
    console.log(req.body);

    // Ensure products is an array and destructure its fields
    if (!Array.isArray(products)) {
      return res.status(400).json({ error: "Products must be an array" });
    }

    const productDetails = products.map(product => ({
      name: product.name,
      quantity: product.quantity,
      price: product.price
    }));

    const fileUrls = req.files.map(file => ({
      filename: file.filename,
      url: `/uploads/${file.filename}`
    }));

    const newOrder = new PurchaseOrder({
      supplier,
      orderedBy,
      email,
      products: productDetails,
      urgency,
      files: fileUrls,
      remarks
    });

    await newOrder.save();
    res.status(200).json({ newOrder });
  } catch (error) {
    console.error("Error creating purchase order:", error);
    res.status(400).json({ message: "Error creating purchase order", error });
  }
});

// Update order status
router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Pending", "Completed", "Rejected","Approved"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updatedOrder = await PurchaseOrder.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: "Error updating order", error });
  }
});

// Delete an order
router.delete("/:id", async (req, res) => {
  try {
    const deletedOrder = await PurchaseOrder.findByIdAndDelete(req.params.id);
    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting order", error });
  }
});

// Delete all orders
router.delete("/", async (req, res) => {
  try {
    await PurchaseOrder.deleteMany({});
    res.json({ message: "All orders deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting all orders", error });
  }
});

module.exports = router;