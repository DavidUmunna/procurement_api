const express=require("express")
const invoicing=require("../../models/invoicing")
const skipsTracking=require("../../models/skips_tracking")
const auth=require("../../middlewares/check-auth")
const { getPagination ,getPagingData} = require("../../Global_Functions/pagination")
const SkipTracking = require("../../models/skips_tracking")
const analytics=require("../../controllers/v1.controllers/Analytics")
const router=express.Router()
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit'); // for PDF export

router.get("/",auth,async(req,res)=>{
    try{
        const {page,limit,skip}=getPagination(req)
        const filter={}
        const {WasteSource,startDate,endDate,search}=req.query;

        if (WasteSource && WasteSource!=='All') filter.WasteSource=WasteSource
        
        if (search){
            filter.$or=[
                {skip_id:{$regex:search, $option:'i'}},

            ]
        }
        if (startDate!=='' && endDate!=='') {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // include full end day
           
            filter.DateMobilized = {
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





router.post("/export", auth, async (req, res) => {
  try {
    const { startDate, endDate, stream, fileName, fileFormat, WasteSource } = req.body;

    const query = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    if (stream && stream !== 'All') {
      query.WasteStream = stream;
    }
    if (WasteSource && WasteSource !=="All" ){
      query.WasteSource=WasteSource
    }
   
    const skipData = await skipsTracking.find(query).lean();

    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9-_]/g, '_');
    const timestamp = Date.now();
    const validFormats = ['xlsx', 'csv', 'pdf'];
    const extension = validFormats.includes(fileFormat) ? fileFormat : 'xlsx';

    res.setHeader('Cache-Control', 'no-store');

    // Export logic by format
    if (extension === 'xlsx') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Skip Tracking');

      worksheet.columns = [
        { header: 'Skip ID', key: 'skip_id', width: 20 },
        { header: 'Delivery Waybill No', key: 'DeliveryWaybillNo', width: 20 },
        { header: 'Date Mobilized', key: 'DateMobilized', width: 20 },
        { header: 'Date Recieved On Location', key: 'DateReceivedOnLocation', width: 20 },
        { header: 'Skips Truck Reg No', key: 'SkipsTruckRegNo', width: 20 },
        { header: 'Skips Truck Driver', key: 'SkipsTruckDriver', width: 20 },
        { header: 'Quantity Value', key: 'Quantity_value', width: 15 },
        { header: 'Quantity Unit', key: 'Quantity_unit', width: 15 },
        { header: 'Waste Stream', key: 'WasteStream', width: 20 },
        { header: 'Waste Source', key: 'WasteSource', width: 20 },
        { header: 'Dispatch Manifest No', key: 'DispatchManifestNo', width: 25 },
        { header: 'Waste Truck Reg No', key: 'WasteTruckRegNo', width: 25 },
        { header: 'Waste Truck Driver Name', key: 'WasteTruckDriverName', width: 20 },
        { header: 'Demobilization Of Filled Skips', key: 'DemobilizationOfFilledSkips', width: 30 },
        { header: 'Date Filled', key: 'DateFilled', width: 20 },
        { header: 'Last Updated', key: 'lastUpdated', width: 25 },
        { header: 'Created At', key: 'createdAt', width: 25 },
        { header: 'Updated At', key: 'updatedAt', width: 25 }
      ];

      skipData.forEach(entry => {
        worksheet.addRow({
          skip_id: entry.skip_id,
          DeliveryWaybillNo: entry.DeliveryWaybillNo,
          DateMobilized:entry.DateMobilized?.toISOString().split("T")[0],
          DateReceivedOnLocation:entry.DateReceivedOnLocation?.toISOString().split("T")[0],
          SkipsTruckRegNo:entry.SkipsTruckRegNo,
          SkipsTruckDriver:entry.SkipsTruckDriver,
          Quantity_value: entry.Quantity?.value,
          Quantity_unit: entry.Quantity?.unit,
          WasteStream: entry.WasteStream,
          WasteSource: entry.WasteSource,
          DispatchManifestNo: entry.DispatchManifestNo,
          WasteTruckRegNo: entry.WasteTruckRegNo,
          WasteTruckDriverName: entry.WasteTruckDriverName,
          DemobilizationOfFilledSkips: entry.DemobilizationOfFilledSkips?.toISOString().split("T")[0],
          DateFilled: entry.DateFilled?.toISOString().split("T")[0],
          lastUpdated: entry.lastUpdated?.toISOString().split("T")[0],
          createdAt: entry.createdAt?.toISOString().split("T")[0],
          updatedAt: entry.updatedAt?.toISOString().split("T")[0]
        });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${sanitizedFileName}-${timestamp}.xlsx`);
      await workbook.xlsx.write(res);
      res.end();

    } else if (extension === 'csv') {
      // Manually build CSV content
      const headers = [
        'Skip ID', 'Delivery Waybill No','Date Mobilized','Date Recieved','Skips Truck Reg No','Skips Truck Driver', 'Quantity Value', 'Quantity Unit',
        'Waste Stream', 'Source Well', 'Dispatch Manifest No', 'Waste Truck Reg No',
        'Waste Driver Name', 'Demobilization Of Filled Skips',
        'Date Filled', 'Last Updated', 'Created At', 'Updated At'
      ];

      const rows = skipData.map(entry => ([
          entry.skip_id,
          entry.DeliveryWaybillNo,
          entry.DateMobilized?.toISOString().split("T")[0],
          entry.DateReceivedOnLocation?.toISOString().split("T")[0],
          entry.SkipsTruckRegNo,
          entry.SkipsTruckDriver,
          entry.Quantity?.value,
          entry.Quantity?.unit,
          entry.WasteStream,
          entry.WasteSource,
          entry.DispatchManifestNo,
          entry.WasteTruckRegNo,
          entry.WasteTruckDriverName,
          entry.DemobilizationOfFilledSkips?.toISOString().split("T")[0],
         entry.DateFilled?.toISOString().split("T")[0],
         entry.lastUpdated?.toISOString().split("T")[0],
         entry.createdAt?.toISOString().split("T")[0],
         entry.updatedAt?.toISOString().split("T")[0]
      ]));

      const csvContent = [
        headers.join(','),
        ...rows.map(r => r.map(field => `"${field ?? ''}"`).join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${sanitizedFileName}-${timestamp}.csv`);
      res.send(csvContent);

    } else if (extension === 'pdf') {
      // Create a PDF
      const doc = new PDFDocument({ margin: 30, size: 'A4' });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${sanitizedFileName}-${timestamp}.pdf`);
      doc.pipe(res);

      doc.fontSize(14).text('Skip Tracking Report', { align: 'center' }).moveDown();

      skipData.forEach((entry, idx) => {
        doc
          .fontSize(10)
          .text(`Skip ID: ${entry.skip_id}`)
          .text(`Delivery Waybill No: ${entry.DeliveryWaybillNo}`)
          .text(`Quantity: ${entry.Quantity?.value ?? ''} ${entry.Quantity?.unit ?? ''}`)
          .text(`Waste Stream: ${entry.WasteStream}`)
          .text(`Source Well: ${entry.WasteSource}`)
          .text(`Dispatch Manifest No: ${entry.DispatchManifestNo}`)
          .text(`Waste Truck Reg No: ${entry.WasteTruckRegNo}`)
          .text(`Waste Truck Driver Name: ${entry.WasteTruckDriverName}`)
          .text(`Demobilization Of Filled Skips: ${entry.DemobilizationOfFilledSkips}`)
          .text(`Date Filled: ${entry.DateFilled}`)
          .text(`Last Updated: ${entry.lastUpdated}`)
          .text(`Created At: ${entry.createdAt}`)
          .text(`Updated At: ${entry.updatedAt}`)
          .moveDown();

        if ((idx + 1) % 3 === 0) doc.addPage(); // paginate
      });

      doc.end();
    }

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Error exporting skip data.' });
  }
});


router.get('/categories', auth, async (req, res) => {
  try {
    // Return your predefined categories
    const categories=["WBM_Affluent","OBM_Cutting","WBM_cutting","OBM_Affluent","Sludge","Others"]
    res.json({ 
      success: true, 
      data: {categories}
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
});

const normalizeDate = (dateString) => {
  if (!dateString) return null;
  // Always interpret as UTC date (ignore local offset)
  const d = new Date(dateString);
  d.setDate(d.getDate() + 1);
  return d;//plus one day
};

router.post("/create",auth,async(req,res)=>{
    try{

        const {skip_id,
            DeliveryWaybillNo,
            DateMobilized,
            DateReceivedOnLocation,
            SkipsTruckRegNo,
            SkipsTruckDriver,
            Quantity,WasteStream,
            WasteSource,DispatchManifestNo,
            WasteTruckRegNo,
            DemobilizationOfFilledSkips,WasteDriverName,
            DateFilled}=req.body
            //console.log("dateMobilized",DateMobilized)
            if (!skip_id){
                res.status(403).json({message:"missing values in query"})
            }
            const NormalizedDateMobilized=normalizeDate(DateMobilized)
            const NormalizedDateRecievedOnLocation=normalizeDate(DateReceivedOnLocation)
            const NormalizedDemob=normalizeDate(DemobilizationOfFilledSkips)
            const NormailizedFilled=normalizeDate(DateFilled)
            const new_skipItem=new skipsTracking({
                skip_id,
                DeliveryWaybillNo,
                DateMobilized:NormalizedDateMobilized,
                DateReceivedOnLocation:NormalizedDateRecievedOnLocation,
                SkipsTruckRegNo,
                SkipsTruckDriver, 
                Quantity,WasteStream,
                WasteSource,DispatchManifestNo,
                WasteTruckRegNo,
                DemobilizationOfFilledSkips:NormalizedDemob,
                DateFilled:NormailizedFilled
                ,WasteDriverName
            })
            //console.log("new skip item",new_skipItem)
            
            await new_skipItem.save()
            res.status(200).json({success:true,message:"new skip item created successfully "})
        }catch(error){
            console.error("error originated from skips route POST:",error)
            res.status(500).json({message:"server error, skip item creation unsuccessful"})
        }
})



router.put("/:id",auth, async (req, res) => {
  try {
    const { id } = req.params; 

    const {
      DeliveryWaybillNo,
      DateMobilized,
      DateReceivedOnLocation,
      SkipsTruckRegNo,
      SkipsTruckDriver,
      Quantity,
      DispatchManifestNo,
      WasteTruckRegNo,
      WasteTruckDriverName,
      DemobilizationOfFilledSkips,
      DateFilled
    } = req.body;
    
    
    // Build the update payload
    const payload = {
      DeliveryWaybillNo,
      SkipsTruckDriver,
      SkipsTruckRegNo,
      DateReceivedOnLocation,
      DateMobilized, 
      Quantity,
      DispatchManifestNo,
      WasteTruckRegNo,
      WasteTruckDriverName,
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
    let { startDate, endDate } = req.query;

    // Validate dates
    if (!startDate || !endDate) {
      startDate=new Date(new Date().setDate(1))
      endDate=new Date()
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