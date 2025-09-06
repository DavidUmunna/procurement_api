const { Router } = require("express");
const Product = require("../../models/Product");

const router = Router();

// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().populate("product");
    res.json(products);
   
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create a new product
router.post("/", async (req, res) => {
  try {
    const {name, description,category,price,stock,supplier}=req.body;
    const new_product=new Product( {name, description,category,price,stock,supplier})
    
    await new_product.save();
    res.status(201).json(new_product);
  } catch (error) {
    res.status(400).json({ message: "Error creating product" });
  }
});

module.exports = router;