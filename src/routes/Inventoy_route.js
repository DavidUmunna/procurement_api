const express = require('express');
const router = express.Router();
const invetoryItem = require('../models/inventory');
const auth = require('../middleware/check-auth');
const InventoryItem = require('../models/inventory');



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
      const categories=[{_id:1,name:'procurement_items'},{_id:2,name:'lab_items'}]
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
    const newItem = new invetoryItem({
      name,
      category,
      quantity,
      sku,
      addedBy: req.user.name
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

router.put("/:id",async(req,res)=>{
    try{
        const {id}=req.params
        const {new_qauntiity}= req.body
        const inventory=await invetoryItem.findById(id)
        if (!inventory){
            res.status(404).json({message:"inventory documenet not found"})
        }
        
        inventory.quantity=invetoryItem.quantity+new_qauntiity
        res.status(200).json({message:"quantity updated successfully",data:inventory.quantity})

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