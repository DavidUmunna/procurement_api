const express = require('express');
const router = express.Router();
const invetoryItem = require('../models/inventory');
const auth = require('../middlewares/check-auth');
const InventoryItem = require('../models/inventory');
const Activity=require("../models/Activity")


function generateSKU(name) {
    const prefix = name.substring(0, 3).toUpperCase(); 
    const unique = Date.now().toString().slice(-5);    
    return `${prefix}-${unique}`;     
}  


router.get('/', auth, async (req, res) => {
    try {
      const { category, search } = req.query;
  
      const filter = {};
  
      if (category && category !== 'All') filter.category = category;
      
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
         
          { sku: { $regex: search, $options: 'i' } }
        ];
      }
  
      const items = await InventoryItem.find(filter)
        .sort({ lastUpdated: -1 })
        .lean();
      if(!items){
        res.status(404).json({success:false,message:"no  items available"})
      }
  
        res.json({ success: true, data: items });
    } catch (err) {
      console.error("from inventory get:",err)
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  });

  router.get('/categories', auth, async (req, res) => {
    try {
      // Return your predefined categories
      const categories=[{ _id:1,name:'procurement_items'},{ _id:2,name:'lab_items'}]

      res.json({ 
        success: true, 
        data: {categories}
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch categories' });
    }
  });

router.post('/', auth, async (req, res) => {
  try {
    const { name, category, quantity } = req.body;
    const sku=generateSKU(name)
    const newItem = new InventoryItem({
      name,
      category,
      quantity,
      sku,
      addedBy: req.user.name
    });
    await Activity.create({
        action: 'Created',
        itemId: newItem._id,
        itemName: newItem.name,
        quantity: newItem.quantity,
        category:newItem.category,
        user: req.user._id,
        userName: req.user.name
      });

    

    await newItem.save();
    res.status(201).json({ success: true, data: newItem });
  } catch (err) {
    console.error("a posting error:",err)
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: Object.values(err.errors).map(val => val.message) 
      });
    }
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

router.put("/:id",auth,async(req,res)=>{
    try{
        const { quantity } = req.body;
        const item = await InventoryItem.findById(req.params.id);
        
        if (!item) return res.status(404).json({ error: 'Item not found' });
    
        const action = quantity > 0 ? 'Added' : 'Removed';
        const absQuantity = Math.abs(quantity);
    
        // Update quantity
        item.quantity += quantity;
        if (item.quantity < 0) item.quantity = 0;
        item.lastUpdated = Date.now();
        await item.save();
    
        // Log activity
        await Activity.create({
          action,
          itemId: item._id,
          itemName: item.name,
          quantity: absQuantity,
          category:item.category,
          user: req.user._id,
          userName: req.user.name
        });
    
        res.json({ data: item });
    }catch(error){
        console.error("error originated from update quantity:",error)
        res.status(500).json({message:"server error"})

    }

})
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedItem = await InventoryItem.findByIdAndDelete(req.params.id);
    
    if (!deletedItem) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, data: {} });
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});





module.exports=router;