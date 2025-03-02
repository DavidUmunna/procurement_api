const { Router } = require("express");
const PurchaseOrder = require("../models/PurchaseOrder");
const Product = require("../models/Product");
const Supplier = require("../models/Supplier");

const router = Router();

// 🛒 Get all purchase orders
router.get("/", async (req, res) => {
  try {
    const orders = await PurchaseOrder.find()
      .populate("supplier", "name email phone")
      .populate("products.product", "name price");

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// 📦 Create a new purchase order
router.post("/PurchaseOrder", async (req, res) => {
  try {
    const { supplier, products } = req.body;

    // Validate supplier existence
    const existingSupplier = await Supplier.findById(supplier);
    if (!existingSupplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    // Validate products existence
    for (let item of products) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }
    }

    const newOrder = new PurchaseOrder({
      supplier,
      products,
    });

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(400).json({ message: "Error creating purchase order", error });
  }
});

// 📝 Update order status
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

// ❌ Delete an order
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

module.exports = router;