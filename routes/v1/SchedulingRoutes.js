const express=require("express")
const PurchaseOrder=require("../../models/PurchaseOrder")
const router=express.Router()
const Exceljs=require("exceljs")
const mongoose=require("mongoose")
const auth=require("../../middlewares/check-auth")
const DisbursementSchedule=require("../../models/DisbursementSchedule")
const { getPagination, getPagingData } = require("../../Global_Functions/pagination")
// Get approved purchase orders
router.get('/purchase-orders', async (req, res) => {
  const { status } = req.query;
  const query = status ? { 
     $or: [
    {
      // Approved > 2
      $expr: {
        $gt: [
          {
            $size: {
              $filter: {
                input: "$Approvals",
                as: "admin",
                cond: { $eq: ["$$admin.status", "Approved"] }
              }
            }
          },
          2
        ]
      }
    },
    {
      // At least 1 awaiting funding
      $expr: {
        $gte: [
          {
            $size: {
              $filter: {
                input: "$Approvals",
                as: "admin",
                cond: { $eq: ["$$admin.status", "Awaiting Funding"] }
              }
            }
          },
          1
        ]
      }
    }
  ]
   } : {};
  
   try {
     const orders = await PurchaseOrder.find(query)
     .sort({ createdAt: -1 }).populate("staff")
     const orderObject=orders.map((request)=>{
      const plainRequest=request.toObject()
      return plainRequest
     })
    
     res.json(orderObject);
  } catch (error) {
    console.error("an error occurred in get schedule",error)
    res.status(500).json({ message:"an error occured"});
  }
});

// Create new disbursement schedule
router.post('/disbursement-schedules',auth, async (req, res) => {
  try {
    const schedule = new DisbursementSchedule({
      ...req.body,
      createdBy: req.user.name, // Assuming authenticated user
      status: 'Draft'
    });
    await schedule.save();
    res.status(201).json(schedule);
  } catch (error) {
    console.error("this error occurred in scheduling POST",error)
    res.status(400).json({ message:"An Error Occurred" });
  }
});

// Update schedule
router.put('/disbursement-schedules/:id', async (req, res) => {
  try {
    const updatedSchedule = await DisbursementSchedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('requests.requestId');
    
    res.json(updatedSchedule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
// Get schedules by status
router.get('/disbursement-schedules', async (req, res) => {
  const { status } = req.query;
  const {page,limit,skip}=getPagination(req)
  let query = {};
  
  if (status === '!Draft') {
    query = { status: { $ne: 'Draft' } };
  } else if (status) {
    query = { status };
  }
  
  try {
    const [total,schedules] = await Promise.all([
       DisbursementSchedule.countDocuments(query)
      ,DisbursementSchedule.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("paymentDetails")
      .populate('requests.requestId')])
    
   
    res.json({schedules:schedules,Pagination:getPagingData(total,page,limit)});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/disbursement-schedules-unpaged', async (req, res) => {
  const { status } = req.query;
  
  let query = {};
  
  if (status === '!Draft') {
    query = { status: { $ne: 'Draft' } };
  } else if (status) {
    query = { status };
  }
  
  try {
    const schedules = await 
      DisbursementSchedule.find(query)
      .sort({ createdAt: -1 })
      .populate("paymentDetails")
      .populate({path:'requests.requestId',
        populate: { // Nested population for staff reference
          path: 'staff',
          model: 'user', 
          select: 'name email Department role' // Only include necessary staff fields
        }
      
      })
    
   
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/disbursement-schedules/:id', async (req, res) => {
  try {
    const schedule = await DisbursementSchedule.findById(req.params.id)
      .populate("paymentDetails")
      .populate({
        path: 'requests.requestId',
        populate: { // Nested population for staff reference
          path: 'staff',
          model: 'user', 
          select: 'name email Department role' // Only include necessary staff fields
        },
         
      })
      .lean(); // Convert to plain JS object

    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    // Transform the data for easier frontend consumption
    const transformedSchedule = {
      ...schedule,
      requests: schedule.requests.map(r => ({
        ...r,
        request: r.requestId, // Flatten the request object
        included: r.included
      }))
    };

    res.json(transformedSchedule);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve schedule',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.patch('/disbursement-schedules/:id/review', async (req, res) => {
  
  try {
    const { id } = req.params;
    const { status, requests, mdComments, removedRequests = [] } = req.body;

    // Validate input
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid schedule ID' });
    }

    if (!status || !requests) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const validStatuses = ["Reviewed by MD", "Approved For Funding", "Returned"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    // 1. Update the schedule
    const updatedSchedule = await DisbursementSchedule.findByIdAndUpdate(
      id,
      {
        status,
        requests,
        mdComments,
        reviewedByMDAt: new Date(),
        $push: { reviewHistory: { status, reviewedAt: new Date() } }
      },
      { new: true }
    ).populate('requests.requestId');

    if (!updatedSchedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    // 2. Update removed requests to "Awaitng Funding" status (in transaction)
    if (removedRequests.length > 0) {
      await PurchaseOrder.updateMany(
        { _id: { $in: removedRequests } },
        { $set: { status: 'Awaiting Funding' } },
        
      );
    }

    // 3. Create audit log
   

   

    res.json({
      success: true,
      data: {
        ...updatedSchedule.toObject(),
        removedRequestsCount: removedRequests.length
      }
    });

  } catch (error) {
   
    
    console.error('Review error:', error);
    res.status(500).json({
      error: 'Failed to process review',
      details: process.env.NODE_ENV === 'development' 
        ? error.message 
        : undefined
    });
  } 
});


router.get("/accounts/export-schedule/:id", async (req, res) => {
  try {
    const schedule = await DisbursementSchedule.findById(req.params.id)
    .populate('paymentDetails')
      .populate({path: 'requests.requestId',
        populate: { // Nested population for staff reference
          path: 'staff',
          model: 'user', 
          select: 'name email Department role' // Only include necessary staff fields
        },})
        .lean();

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    // Create workbook & sheet
    const workbook = new Exceljs.Workbook();
    const worksheet = workbook.addWorksheet("Disbursement Schedule");

    // Title row
    worksheet.mergeCells("A1", "E1");
    worksheet.getCell("A1").value = "Accounts Department - Disbursement Schedule";
    worksheet.getCell("A1").font = { size: 16, bold: true };
    worksheet.getCell("A1").alignment = { horizontal: "center" };

    // Basic info
    worksheet.addRow([]);
    worksheet.addRow(["Name", schedule.name]).alignment={horizontal:"center"}
    worksheet.addRow(["Created By", schedule.createdBy]).alignment={horizontal:"center"}
    worksheet.addRow(["Total Amount", `₦${schedule.totalAmount}`],).alignment={horizontal:"center"}
    worksheet.addRow(["Status", schedule.status]).alignment={horizontal:"center"}
    worksheet.addRow(["Created At", schedule.createdAt.toDateString()]).alignment={horizontal:"center"}
    worksheet.addRow([]);

    // Requests table header
    worksheet.addRow(["Sn","Order Number","Title","Requested By","Department","Total Price"]).font = { bold: true };

    // Requests table data
    schedule.requests.filter((reqItem, index) => (reqItem.included===true &&(

      worksheet.addRow([
        index + 1,
        reqItem.requestId?.orderNumber || reqItem.requestId,
        reqItem.requestId?.Title,
        reqItem.requestId?.staff.name,
        reqItem.requestId?.staff.Department,
        reqItem.requestId?.products.reduce(
          (sum,product)=>(
            sum+(product.price*product.quantity)
          ),0
        )
      ]).alignment={horizontal:"center"}
    )
    ));

    worksheet.addRow(["Beneficiary Name",'Account Number',"Bank"]).font={bold:true}
    schedule.paymentDetails.map((detail)=>(
      worksheet.addRow([
        
        detail.Beneficiary,
        detail.AccountNumber,
        detail.Bank
      ]).alignment={horizontal:"center"}
    ))


    // Auto-fit columns
    worksheet.columns.forEach(column => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, cell => {
        const cellLength = cell.value ? cell.value.toString().length : 0;
        if (cellLength > maxLength) {
          maxLength = cellLength;
        }
      });
      column.width = maxLength < 10 ? 10 : maxLength;
    });

    // Send Excel to client
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=schedule_${schedule._id}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});



// Submit schedule to MD
router.patch('/disbursement-schedules/:id/submit', async (req, res) => {
  try {
    const schedule = await DisbursementSchedule.findByIdAndUpdate(
      req.params.id,
      { status: 'Submitted to MD' },
      { new: true }
    );
    res.json(schedule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


router.delete("/disbursement-schedules/:id",auth,async(req,res)=>{
  try{
    const {id}=req.params

    await DisbursementSchedule.findByIdAndDelete(id)
   
    res.status(200).json({message:"schedule deleted successfully"})
  }catch(error){
    console.error("An error occurrred",error)
    res.status(500).json({message:"there was an error Deleting"})
  }
})



module.exports=router;