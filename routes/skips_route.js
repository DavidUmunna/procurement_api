const express=require("express")
const skipsTracking=require("../models/skips_tracking")
const auth=require("../middlewares/check-auth")
const { getPagination } = require("../middlewares/pagination")
const router=express.Router()


router.get("/",auth,async(req,res)=>{
    try{
        const {page,limit,skip}=getPagination(req)
        const filter={}
        const {WasteStream,search}=req.filter;

        if (WasteStream && WasteStream!=='All') filter.WasteStream=WasteStream

        if (search){
            
        }
        
        

        const skipItem=await skipsTracking.find()
        
        if (!skipItem){
            res.status(404).json({success:false,message:"file not found"})
        }
        res.status(200).json({success:true,message:"skip items retrieved successfully"})
    }catch(error){
        console.error("error originated from skip_route GET:",error)
        res.status(500).json({message:"server error"})
    }
})

router.post("/skiptrack",auth,async(req,res)=>{
    const {skip_id,
        DeliveryWaybill,
        Quantity,WasteStream,
        SourceWell,DispatchManifest,
        DeliveryOfEmptySkips,
        DemobilizationOfFilledSkips}=req.body





})

