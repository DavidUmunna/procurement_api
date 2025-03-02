const { Router } = require("express");
const Product = require("../models/Product");

const router = Router();

// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().populate("supplier");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create a new product
router.post("/", async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: "Error creating product" });
  }
});

module.exports = router;