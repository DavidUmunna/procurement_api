const inventorylogs=require("../models/inventory_logs");
const inventory_logs = require('../models/inventory_logs');
const express=require("express")
const {getPagination,getPagingData}=require("../controllers/pagination")

const router=express.Router()


router.post('/create', async(req,res)=>{
  try{

    const {Staff_Name, quantity, inventory_item, purpose,status}=req.body

    const new_log=new inventorylogs({
      Staff_Name,
      quantity,
      inventory_item,
      purpose,
      status
    })

    await new_log.save()

    res.status(200).json({success:true,message:"log created successfully"})
  }catch(error){
    console.error(error)
    res.status(500).json({success:false,message:"log creation unsuccessfully"})
  }
})

router.get("/",async(req,res)=>{
  try{
        const {page,skip,limit}=getPagination(req)
        
        const filter={}
        
          
  
      const [total,items] = await Promise.all([
        inventorylogs.countDocuments(filter),
        inventorylogs.find(filter)
        .sort({ lastUpdated: -1 })
        .lean()
        .skip(skip)
        .limit(limit)
    
    ]);
      if(!items){
        res.status(404).json({success:false,message:"no  items available"})
      }
  
        res.json({ success: true, data: items,Pagination:getPagingData(total,page,limit) });
    } catch (err) {
      console.error("from inventory get:",err)
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  
})

router.put("/:id",async(req,res)=>{
   try{
    const id=req.params.id
    const {Staff_Name, quantity, inventory_item,purpose ,status}=req.body
    const inventory_log_item=await inventory_logs.findById(id)
    if (Staff_Name){
      inventory_log_item.Staff_name=Staff_Name
    }else if(quantity){
      inventory_log_item.quantity=quantity
    }else if(inventory_item){
      inventory_log_item.inventory_item=inventory_item
    }else if(status){
      inventory_log_item.status=status
    }else if(purpose){
      inventory_log_item.purpose=purpose
    }

    await inventory_log_item.save()
    res.status(200).json({success:true, message:"update was successful"})

   }catch(error){
      console.error("error originated from inventory route PUT",error)
      res.status(500).json({success:false, message:"update was unsuccessful"})
   }
})

router.delete("/:id",async(req,res)=>{
    try{

        const id =req.params.id
        console.log("id",id)
        const inventorylog=await inventorylogs.findOneAndDelete(id)
        
        await inventorylog.save()
        res.status(200).json({success:true,message:"delete was successful"})
    }catch(error){
        console.error("error from delete end:",error)
        res.status(500).json({success:false,message:"server error"})
    }


})
router.post("/export", async(req,res)=>{
    try{
        const {startDate,endDate, status,filename}=req.body

        const query={
            createdAt:{
                $gte:new Date(startDate),
                $lte:new Date(endDate)
            }
        }
        if (status &&  status!=="All"){
            query.status=status
        }

        const inventorylog=await inventory_logs.find(query)

        const sanitizedFileName=filename.replace(/[^a-zA-Z0-9-_]/g,'_');
        const timestamp=Date.now()
        const validFormats=["xlxs"]

        
    }catch(error){
        console.error('Export error:', error);
        res.status(500).json({ message: 'Error exporting skip data.' });
    }
})





module.exports=router;