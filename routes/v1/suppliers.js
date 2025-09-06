const { Router } = require("express");
const Supplier = require("../../models/Supplier");
const order=require("./orders")
const router = Router();
const csrf=require("csurf")
const csrfProtection=csrf({cookie:true})
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
router.post("/",csrfProtection, async (req, res) => {
  try {
    const {name,email,phone,address,description,status}=req.body.form
    const supplier = new Supplier({name,email,phone,address,description,status});
    await supplier.save();
    res.status(201).json({message:"supplier added successfully"});
  } catch (error) {
    console.log("error originated from supplier post:",error)
    res.status(400).json({ message: "Error creating supplier" });
  }
});

module.exports = router;