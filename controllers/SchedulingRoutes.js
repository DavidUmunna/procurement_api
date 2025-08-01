const express=require("express")
const PurchaseOrder=require("../models/PurchaseOrder")
const router=express.Router()
const mongoose=require("mongoose")
const auth=require("../middlewares/check-auth")
const DisbursementSchedule=require("../models/DisbursementSchedule")
const { getPagination, getPagingData } = require("./pagination")
// Get approved purchase orders
router.get('/purchase-orders', async (req, res) => {
  const { status } = req.query;
  const query = status ? { status } : {};
  
  try {
    const orders = await PurchaseOrder.find(query)
      .sort({ createdAt: -1 }).populate("staff")
    res.json(orders);
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
      .populate('requests.requestId')
    
   
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/disbursement-schedules/:id', async (req, res) => {
  try {
    const schedule = await DisbursementSchedule.findById(req.params.id)
      .populate({
        path: 'requests.requestId',
        populate: { // Nested population for staff reference
          path: 'staff',
          model: 'user', // Make sure this matches your User model name
          select: 'name email Department role' // Only include necessary staff fields
        },
         // Only include necessary fields
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

    // 2. Update removed requests to "On Hold" status (in transaction)
    if (removedRequests.length > 0) {
      await PurchaseOrder.updateMany(
        { _id: { $in: removedRequests } },
        { $set: { status: 'On Hold' } },
        
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



module.exports=router;