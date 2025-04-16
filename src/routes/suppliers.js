const { Router } = require("express");
const Supplier = require("../models/Supplier");
const order=require("./orders")
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
router.get('/:supplier/requests', async (req, res) => {
  try{

    const supplier = req.params.id;
    if(!supplier){
      res.status(401).json({message:"supplier not in list"})
    }
    const requests = await order.find({ name:supplier});
    
    res.status(200).json(requests);
  }catch(error){
    console.log("an error occured:",error)
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