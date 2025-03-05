const { Router } = require("express");
const mongoose = require("mongoose");
const PurchaseOrder = require("../models/PurchaseOrder");
const Product = require("../models/Product");
const Supplier = require("../models/Supplier");

const router = Router();

// Get all purchase orders
router.get("/", async (req, res) => {
  try {
    const orders = await PurchaseOrder.find()
      .populate("supplier", "name email phone")
      .populate("products", "Name quantity price");

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Create a new purchase order
router.post("/", async (req, res) => {
  try {const { supplier, products, orderedBy } = req.body;
        
        //const {name, quantity}=products

    // Validate supplier existence
    /*if (!mongoose.Types.ObjectId.isValid(supplier)) {
      return res.status(400).json({ message: "Invalid supplier ID format" });
    }

    const existingSupplier = await Supplier.findById(supplier);
    if (!existingSupplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }*/

    // Validate products existence
    /*for (let item of products) {
      if (!mongoose.Types.ObjectId.isValid(item.product)) {
        return res.status(400).json({ message: `Invalid product ID format: ${item.product}` });
      }

      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }
    }*/

    const newOrder = new PurchaseOrder({
      
      supplier,
      products,
      orderedBy
    });

    await newOrder.save();
    res.status(201).json({ newOrder });
  } catch (error) {
    res.status(400).json({ message: "Error creating purchase order", error });
  }
});

// Update order status
router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Pending", "Completed", "Cancelled"];

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