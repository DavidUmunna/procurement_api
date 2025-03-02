const { Router } = require("express");
const Supplier = require("../models/Supplier");

const router = Router();

// Get all suppliers
router.get("/", async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create a new supplier
router.post("/", async (req, res) => {
  try {
    const supplier = new Supplier(req.body);
    await supplier.save();
    res.status(201).json(supplier);
  } catch (error) {
    res.status(400).json({ message: "Error creating supplier" });
  }
});

module.exports = router;