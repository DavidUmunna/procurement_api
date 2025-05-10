const { Router } = require("express");
const mongoose = require("mongoose");
const PurchaseOrder = require("../models/PurchaseOrder");
const multer = require("multer");
const path = require("path");
const user=require("../models/users_")
const fs = require("fs");
const file=require("./fileupload")
const auth=require("../middlewares/check-auth")
const uploadDir = path.join(__dirname, "../uploads");
const exporttoexcel=require("../exporttoexcel")
const router = Router();
const {getPagination,getPagingData}=require('../middlewares/pagination')
const notifyAdmins=require("../emailnotification/emailNotification");




router.get("/accounts", auth,async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);
    const query = {status:"Approved"};

    if (req.query.action) {
      query.action = req.query.action;
    }
    console.log(req.user)
    if (req.query.startDate && req.query.endDate) {
      query.timestamp = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    const global=[ "procurement_officer","human_resources","internal_auditor","global_admin","admin","accounts"]
    //const isAdmin= req.user.role==="admin"
   const [total, orders] = await Promise.all([
           PurchaseOrder.countDocuments(query),
           PurchaseOrder.find(query)
             .sort({ createdAt: -1 })
             .skip(skip)
             .limit(limit)
             
             
         ]);
    const filteredOrders = orders.filter((order) => order.status?.trim().toLowerCase() === "approved");
    console.log("Statuses in fetched orders:", orders.map(o => o.status));

    const response=(filteredOrders.map((order=>{
      const plainOrder=order.toObject()
      if(!global.includes(req.user.role)){
        delete  plainOrder.Approvals
      }
      return plainOrder
    })))
    console.log(filteredOrders)

    res.json({data:response,
      Pagination:getPagingData(total,page,limit)});
  } catch (error) {
    console.error(error)
    //res.status(500).json({ message: "Server error", error });
  }
});
router.get("/all", auth,async (req, res) => {
  try {
   

    

    const global=[ "procurement_officer","human_resources","internal_auditor","global_admin","admin"]
    //const isAdmin= req.user.role==="admin"
    const orders=await PurchaseOrder.find()
      
    const response=(orders.map((order=>{
      const plainOrder=order.toObject()
      if(!global.includes(req.user.role)){
        delete  plainOrder.Approvals
      }
      return plainOrder
    })))
    res.json({data:response});
  } catch (error) {
    console.error(error)
    //res.status(500).json({ message: "Server error", error });
  }
});
// Get all purchase orders
router.get("/", auth,async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);
    const query = {};

    if (req.query.action) {
      query.action = req.query.action;
    }
    console.log(req.user)
    if (req.query.startDate && req.query.endDate) {
      query.timestamp = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    const global=[ "procurement_officer","human_resources","internal_auditor","global_admin","admin"]
    //const isAdmin= req.user.role==="admin"
   const [total, orders] = await Promise.all([
           PurchaseOrder.countDocuments(query),
           PurchaseOrder.find(query)
             .sort({ createdAt: -1 })
             .skip(skip)
             .limit(limit)
             
             
         ]);
      
    const response=(orders.map((order=>{
      const plainOrder=order.toObject()
      if(!global.includes(req.user.role)){
        const plainOrder = order.toObject();
        delete  plainOrder.Approvals
      }
      return plainOrder
    })))
    res.json({data:response,
      Pagination:getPagingData(total,page,limit)});
  } catch (error) {
    console.error(error)
    //res.status(500).json({ message: "Server error", error });
  }
});

//if user not admin order.Approvals is removed from document
router.get("/:email", auth,async (req, res) => {
  try {
      const { email } = req.params;
      //const isAdmin= req.user.role==="admin"
      const global=[ "procurement_officer","human_resources","internal_auditor","global_admin","admin"]
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    

    // Fetch user orders
    const userRequests = await PurchaseOrder.find({ email }).sort({createdAt:-1});
    
    const response=(userRequests.map((order=>{
      const plainOrder = order.toObject();
      if(!global.includes(req.user.role)){
        delete  plainOrder.Approvals
      }
      return plainOrder
    })))

    if (!userRequests.length) {
      return res.status(404).json({ message: "No orders found for this email" });
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ error: "Failed to retrieve orders" });
  }
});
//fetch department orders
router.get('/department', auth,async (req, res) => {
  try {
    const {Department}=req.query
    const { page, limit, skip } = getPagination(req);
    const query = {Department:Department};
    // Fetch orders for the department
    const [total, orders] = await Promise.all([
      PurchaseOrder.countDocuments(query),
      PurchaseOrder.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        
        
    ]);
    const global=[ "procurement_officer","human_resources","internal_auditor","global_admin","admin","waste_management"]
    const response=(orders.map((order=>{
      const plainOrder=order.toObject()
      if(!global.includes(req.user.role)){
        delete  plainOrder.Approvals
      }
      return plainOrder
    })))
    
    

    res.json({data:response,
      Pagination:getPagingData(total,page,limit)});
  } catch (error) {
    console.error("Error fetching department orders:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
});

router.get('/department/all', auth,async (req, res) => {
  try {
    const {Department}=req.query
    //const { page, limit, skip } = getPagination(req);
    const query = {Department:Department};
    // Fetch orders for the department
    const [total, orders] = await Promise.all([
      PurchaseOrder.countDocuments(query),
      PurchaseOrder.find(query)
        .sort({ createdAt: -1 })
        
        
        
    ]);
    const global=[ "procurement_officer","human_resources","internal_auditor","global_admin","admin","waste_management"]
    const response=(orders.map((order=>{
      const plainOrder=order.toObject()
      if(!global.includes(req.user.role)){
        delete  plainOrder.Approvals
      }
      return plainOrder
    })))
    
    

    res.json({data:response,
  });
  } catch (error) {
    console.error("Error fetching department orders:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
});




// Create a new purchase order
router.post("/",  async (req, res) => {
  try {
    const { supplier, orderedBy, products,email,filenames, urgency, remarks, Title } = req.body;
    
    //console.log(req.body);

    // Ensure products is an array and destructure its fields
    if (!Array.isArray(products)) {
      return res.status(400).json({ error: "Products must be an array" });
    }

    
    const User=await user.findOne({email})
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const Department=User.Department
    console.log("Department",Department)

    const newOrder = new PurchaseOrder({
      supplier,
      Title,
      orderedBy,
      email,
      products,
      urgency,
      filenames,
      remarks,
      Department
      

    });
    

    await newOrder.save();
    const excelexport=await exporttoexcel()
    //notifyAdmins(newOrder);
    console.log(excelexport)
    res.status(200).json({ newOrder });
  } catch (error) {
    console.error("Error creating purchase order:", error);
    res.status(400).json({ message: "Error creating purchase order", error });
  }
});
router.put("/:id/approve", auth, async (req, res) => {
  const { id: orderId } = req.params;
  const { adminName } = req.body;
  const user = req.user;

  if (!user.canApprove) {
    return res.status(403).json({ message: 'You are not authorized to approve requests' });
  }

  try {
    const order = await PurchaseOrder.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Remove any previous decisions from this admin
    order.Approvals = (order.Approvals || []).filter(
      a => a.admin !== adminName
    );

    // Add new approval
    const newApproval = {
      admin: adminName,
      status: "Approved",
      timestamp: new Date()
    };
    order.Approvals.push(newApproval);

    await order.save();
    return res.status(200).json({ 
      message: "Approval recorded successfully", 
      order,
      yourDecision: newApproval
    });

  } catch (error) {
    console.error("Error approving order:", error);
    res.status(500).json({ message: "Error processing approval", error });
  }
});

router.put("/:id/reject", auth, async (req, res) => {
  const { id: orderId } = req.params;
  const { adminName } = req.body;
  const user = req.user;

  if (!user.canApprove) {
    return res.status(403).json({ message: 'You are not authorized to reject requests' });
  }

  try {
    const order = await PurchaseOrder.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if this specific admin already rejected
    
   
  
   
    
    
    order.Approvals = (order.Approvals || []).filter(
      a => a.admin !== adminName
    );

    // Add new rejection (keeping any previous decisions)
    order.Approvals.push({
      admin: adminName,
      status: "Rejected",
      timestamp: new Date()
    });

    await order.save();
    return res.status(200).json({ 
      message: "Rejection recorded successfully", 
      order,
      yourDecision: {
        admin: adminName,
        status: "Rejected",
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error("Error rejecting order:", error);
    res.status(500).json({ message: "Error processing rejection", error });
  }
});
// Update order status
router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Pending", "Completed", "Rejected","Approved"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updatedOrder = await PurchaseOrder.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: "Error updating order", error });
  }
});

// Delete an order
router.delete("/:id", async (req, res) => {
  try {
    const deletedOrder = await PurchaseOrder.findByIdAndDelete(req.params.id);
    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting order", error });
  }
});

// Delete all orders
router.delete("/", async (req, res) => {
  try {
    await PurchaseOrder.deleteMany({});
    res.json({ message: "All orders deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting all orders", error });
  }
});

module.exports = router;