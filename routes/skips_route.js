const express=require("express")
const skipsTracking=require("../models/skips_tracking")
const auth=require("../middlewares/check-auth")
const { getPagination } = require("../middlewares/pagination")
const router=express.Router()


router.get("/",auth,async(req,res)=>{
    try{
        const {page,limit,skip}=getPagination(req)
        const filter={}
        const {SourceWell,startDate, EndDate,search}=req.filter;

        if (WasteStream && WasteStream!=='All') filter.SourceWell=SourceWell

        if (search){
            filter.$or=[
                {skip_id:{$regex:search, $option:'i'}},

            ]
        }
        if (startDate && EndDate) {
            const start = new Date(startDate);
            const end = new Date(EndDate);
            end.setHours(23, 59, 59, 999); // include full end day
        
            filter.createdAt = {
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
    const {skip_id,
        DeliveryWaybill,
        Quantity,WasteStream,
        SourceWell,DispatchManifest,
        DeliveryOfEmptySkips,
        DemobilizationOfFilledSkips}=req.body





})

