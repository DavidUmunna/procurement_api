const express=require("express")
const invoicing=require("../models/invoicing")
const skipsTracking=require("../models/skips_tracking")
const auth=require("../middlewares/check-auth")
const { getPagination } = require("../middlewares/pagination")
const router=express.Router()


router.get("/",auth,async(req,res)=>{
    try{
        const {page,limit,skip}=getPagination(req)
        const filter={}
        const {SourceWell,startDate, EndDate,search}=req.filter;

        if (SourceWell && SourceWell!=='All') filter.SourceWell=SourceWell

        if (search){
            filter.$or=[
                {skip_id:{$regex:search, $option:'i'}},

            ]
        }
        if (startDate && EndDate) {
            const start = new Date(startDate);
            const end = new Date(EndDate);
            end.setHours(23, 59, 59, 999); // include full end day
        
            filter.DeliveryOfEmptySkips = {
                $gte: start,
                $lte: end
            };
        }
        
        

        const skipItem=await skipsTracking.find(filter)
        .sort({lastUpdated:-1})
        .lean();
        
        if (!skipItem){
            res.status(404).json({success:false,message:"file not found"})
        }
        res.status(200).json({success:true,message:"skip items retrieved successfully"})
    }catch(error){
        console.error("error originated from skip_route GET:",error)
        res.status(500).json({message:"server error"})
    }
})

router.get('/categories', auth, async (req, res) => {
  try {
    // Return your predefined categories
    const categories=["WBM","OBM","WBM_cutting","OBM_Affluent"]
    res.json({ 
      success: true, 
      data: {categories}
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
});

router.post("/skiptrack",auth,async(req,res)=>{
    try{

        const {skip_id,
            DeliveryWaybill,
            Quantity,WasteStream,
            SourceWell,DispatchManifestNo,
            DispatchTruckRegNo,
            DeliveryOfEmptySkips,
            DemobilizationOfFilledSkips,
            DateFilled}=req.body
            if (!skip_id){
                res.status(403).json({message:"missing values in query"})
            }
            new_skipItem=new skipsTracking({
                skip_id,
                DeliveryWaybill,
                Quantity,WasteStream,
                SourceWell,DispatchManifestNo,
                DispatchTruckRegNo,
                DeliveryOfEmptySkips,
                DemobilizationOfFilledSkips,
                DateFilled
            })
            
            await new_skipItem.save()
            res.status(200).json({success:true,message:"new skip item created successfully "})
        }catch(error){
            console.error("error originated from skips route POST:",error)
            res.status(500).json({message:"server error, skip item creation unsuccessful"})
        }
})



router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params; // lowercase `id`, must match route parameter

    const {
      DeliveryWaybillNo,
      Quantity,
      DispatchManifestNo,
      DispatchTruckRegNo,
      DriverName, // make sure this matches your schema
      DemobilizationOfFilledSkips,
      DateFilled
    } = req.body;

    // Build the update payload
    const payload = {
      DeliveryWaybill: DeliveryWaybillNo, // assuming your schema uses `DeliveryWaybill`
      Quantity,
      DispatchManifestNo,
      DispatchTruckRegNo,
      DriverName,
      DemobilizationOfFilledSkips,
      DateFilled
    };

    // Optional: Remove undefined fields (so you don't overwrite with undefined)
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined) {
        delete payload[key];
      }
    });

    if (!id) {
      return res.status(400).json({ message: "Id not provided in URL" });
    }

    const updatedSkip = await SkipTracking.findByIdAndUpdate(
      id,
      { $set: payload },
      { new: true } // return the updated document
    );

    if (!updatedSkip) {
      return res.status(404).json({ message: "Skip item not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Skip item updated successfully",
      data: updatedSkip
    });
  } catch (error) {
    console.error("Error in /:id PUT route:", error);
    return res.status(500).json({
      message: "Server error, skip item update failed"
    });
  }
});


router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedItem = await skipsTracking.findByIdAndDelete(req.params.id);
    
    if (!deletedItem) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, data: {message:"skip data deleted successfully"} });
  } catch (err) {
    console.error("error originated from skip DELETE",err)
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

router.get('/stats', auth, async (req, res) => {
    try {
      const {startDate,endDate}=req.query
  
  
      // Create start and end date for the selected month
      
      // Filter for that month using lastUpdated field (or use createdAt if available)
      const dateFilter = { lastUpdated: { $gte: startDate, $lt: endDate } };
  
      const totalItems = await skipsTracking.countDocuments(dateFilter);
  
      const totalQuantity = await skipsTracking.aggregate([
        { $match: dateFilter },
        { $group: { _id: null, total: { $sum: "$Quantity.value" } } }
      ]);
  
      const categories = await skipsTracking.distinct("WasteStream", dateFilter);
  
      
  
      res.json({
        success: true,
        data: {
          
          totalItems:totalItems||0,
          totalQuantity: totalQuantity[0]?.total || 0,
          totalCategories: categories.length,
          
        }
      });
    } catch (err) {
      console.error("Stats route error:", err);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  });



  module.exports=router;