const express=require("express")
const invoicing=require("../models/invoicing")
const skipsTracking=require("../models/skips_tracking")
const auth=require("../middlewares/check-auth")
const { getPagination ,getPagingData} = require("../middlewares/pagination")
const SkipTracking = require("../models/skips_tracking")
const analytics=require("../controllers/Analytics")
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
        
        

        const [total,items] = await Promise.all([
        skipsTracking.countDocuments(filter),
        skipsTracking.find(filter)
        .sort({ lastUpdated: -1 })
        .lean()
        .skip(skip)
        .limit(limit)])
        
        if (!items){
            res.status(404).json({success:false,message:"file not found"})
        }
        res.status(200).json({success:true,message:"skip items retrieved successfully", data:items,Pagination:getPagingData(total,page,limit) })
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

router.post("/create",auth,async(req,res)=>{
    try{

        const {skip_id,
            DeliveryWaybillNo,
            Quantity,WasteStream,
            SourceWell,DispatchManifestNo,
            DispatchTruckRegNo,
            DeliveryOfEmptySkips,
            DemobilizationOfFilledSkips,DriverName,
            DateFilled}=req.body
            if (!skip_id){
                res.status(403).json({message:"missing values in query"})
            }
            new_skipItem=new skipsTracking({
                skip_id,
                DeliveryWaybillNo,
                Quantity,WasteStream,
                SourceWell,DispatchManifestNo,
                DispatchTruckRegNo,
                DeliveryOfEmptySkips,
                DemobilizationOfFilledSkips,
                DateFilled,DriverName
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
    const { startDate, endDate } = req.query;

    // Validate dates
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Both startDate and endDate are required' });
    }

    // Create date filter (ensure dates are in proper format)
    const dateFilter = { 
      lastUpdated: { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      } 
    };

    // Debug: Check how many documents match the filter
    const matchingDocsCount = await skipsTracking.countDocuments(dateFilter);
    console.log(`Found ${matchingDocsCount} documents in date range`);

    // Get total items (without date filter)
    const totalItems = await skipsTracking.countDocuments();

    // Improved aggregation pipeline
    const aggregationResult = await skipsTracking.aggregate([
      { $match: dateFilter },
      { 
        $project: {
          qtyInTonnes: {
            $switch: {
              branches: [
                { 
                  case: { $eq: ["$Quantity.unit", "kg"] }, 
                  then: { $divide: ["$Quantity.value", 1000] } 
                },
                { 
                  case: { $eq: ["$Quantity.unit", "tonne"] }, 
                  then: "$Quantity.value" 
                },
                // Default case if unit is missing or different
                { case: { $eq: ["$Quantity.unit", "ton"] }, then: "$Quantity.value" },
                { case: { $eq: ["$Quantity.unit", "t"] }, then: "$Quantity.value" }
              ],
              default: 0 // If unit not recognized
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          totalTonnes: { $sum: "$qtyInTonnes" },
          count: { $sum: 1 } // Count of documents for verification
        }
      },
      { 
        $project: { 
          _id: 0, 
          totalTonnes: { $round: ["$totalTonnes", 2] }, // Round to 2 decimal places
          count: 1 
        } 
      }
    ]);

    const totalTonnes = aggregationResult[0]?.totalTonnes || 0;
    console.log("Aggregation result:", aggregationResult);

    const categories = await skipsTracking.distinct("WasteStream", dateFilter);

    res.json({
      success: true,
      data: {
        totalItems,
        totalQuantity: totalTonnes,
        totalCategories: categories.length,
        matchingItemsCount: aggregationResult[0]?.count || 0 // For debugging
      }
    });
  } catch (err) {
    console.error("Stats route error:", err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});
  router.get("/analytics",auth,analytics.getSkipAnalytics)


  module.exports=router;