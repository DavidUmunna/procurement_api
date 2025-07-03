const { Router } = require("express");
const mongoose = require("mongoose");
const PurchaseOrder = require("../models/PurchaseOrder");
const multer = require("multer");
const path = require("path");
const user=require("../models/users_")
const fs = require("fs");
const file=require("../models/file")
const auth=require("../middlewares/check-auth")
const uploadDir = path.join(__dirname, "../uploads");
const exporttoexcel=require("../exporttoexcel")
const router = Router();
const {getPagination,getPagingData}=require('../controllers/pagination')
const notifyAdmins=require("../emailnotification/emailNotification");
const exportToExcelAndUpload=require("../Uploadexceltodrive")
const products_=require("../models/Product")
const usemonitor=require("../middlewares/usemonitor")
const ExcelJS=require("exceljs")
const monitorLogger=require("../middlewares/monitorLogger")
const csrf=require("csurf");
const { IncomingRequest, RequestActivity } = require("../controllers/notification");
const csrfProtection=csrf({cookie:true})

router.get("/accounts", auth,async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);
    const query = {status:{$in:["Approved","Completed"]}};

    
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
           PurchaseOrder.find(query).populate("staff", "-password -__v -role -canApprove -_id")
             .sort({ createdAt: -1 })
             .skip(skip)
             .limit(limit)
             
             
         ]);
    console.log(orders)
   const filteredOrders = orders.filter((order) => {
  const status = order.status?.trim().toLowerCase();
  return ["approved", "completed"].includes(status);
});
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
router.get("/all", auth,monitorLogger,async (req, res) => {
  try {
   

    

    const global=[ "procurement_officer","human_resources","internal_auditor","global_admin","admin"]
    //const isAdmin= req.user.role==="admin"
    const orders=await PurchaseOrder.find().populate("staff",  "-password -__v -role -canApprove -_id")
      
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
router.get("/", auth,monitorLogger,async (req, res) => {
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
             .limit(limit).populate("staff", "-password -__v -role -canApprove -_id")
             
             
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
router.get('/department', auth, async (req, res) => {
  try {
    const { Department } = req.query;
    const { page, limit, skip } = getPagination(req);

    // Use populate first, then filter using JS
    const allOrders = await PurchaseOrder.find()
      .populate("staff", "Department email name ").populate("products","name quantity price")
      .sort({ createdAt: -1 });

    // Filter by Department (after population)
    const filteredOrders = allOrders.filter(order => 
      order.staff?.Department === Department
    );

    const total = filteredOrders.length;

    // Paginate filtered orders manually
    const paginatedOrders = filteredOrders.slice(skip, skip + limit);

    const globalRoles = [
      "procurement_officer",
      "human_resources",
      "internal_auditor",
      "global_admin",
      "admin",
      "waste_management"
    ];

    const response = paginatedOrders.map(order => {
      const plainOrder = order.toObject();
      /*if (!globalRoles.includes(req.user.role)) {
        delete plainOrder.Approvals;
      }*/
      return plainOrder;
    });

    res.json({
      data: response,
      Pagination: getPagingData(total, page, limit)
    });
  } catch (error) {
    console.error("Error fetching department orders:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
});

//if user not admin order.Approvals is removed from document
router.get("/:id", auth,async (req, res) => {
  try {
      const { id } = req.params;
      //const isAdmin= req.user.role==="admin"
      const global=[ "procurement_officer","human_resources","internal_auditor","global_admin","admin"]
    if (!id) {
      return res.status(400).json({ error: "Email is required" });
    }
    

    // Fetch user orders
    const userRequests = await PurchaseOrder.find({ staff:id }).sort({createdAt:-1}).populate("staff", "-password -__v -role -canApprove -_id")
    .populate("products","name quantity price")
    
    const response=(userRequests.map((order=>{
      const plainOrder = order.toObject();
      /*if(!global.includes(req.user.role)){
        delete  plainOrder.Approvals
      }*/
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

//route is just to display
router.get('/department/all', auth,async (req, res) => {
  try {
    const {Department}=req.query
    //const { page, limit, skip } = getPagination(req);
    const query = {Department:Department};
    // Fetch orders for the department
    const orders = await PurchaseOrder.find().populate("staff", "Department")
        .sort({ createdAt: -1 })
              
  
    const filteredOrders = orders.filter(order => 
      order.staff?.Department === Department
    );


    const global=[ "procurement_officer","human_resources","internal_auditor","global_admin","admin","waste_management"]
    
    
    

    res.json({data:filteredOrders,
  });
  } catch (error) {
    console.error("Error fetching department orders:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
});




// Create a new purchase order
router.post("/", usemonitor,csrfProtection, async (req, res) => {
  try {
    const { supplier, orderedBy, products,email,filenames, urgency, remarks, Title,staff } = req.body;
    
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

    const newOrder = new PurchaseOrder({
      supplier,
      Title,
      orderedBy,
      email,
      products,
      urgency,
      filenames,
      remarks,
      Department,
      staff,
      fileRefs: req.body.fileRefs,
      

    });
    
    
    const new_Request=await newOrder.save();
    IncomingRequest(new_Request._id)
    // const filename=new_Request.filenames
    // new_Request.requestfileid=await file.find({})
    const excelexport=await exporttoexcel();
    const exportgoogledrive=await exportToExcelAndUpload(newOrder._id);
    //notifyAdmins(newOrder);
    
    console.log(exportgoogledrive)
    res.status(200).json({success:true, newOrder });
  } catch (error) {
    console.error("Error creating purchase order:", error);
    res.status(500).json({success:false, message: "Error creating purchase order", error });
  };
});

router.post("/export", async (req, res) => {
  try {
    const { startDate, endDate, status, filename } = req.body;

    // Input validation
    if (!startDate || !endDate || !filename) {
      return res.status(400).json({ message: "startDate, endDate, and filename are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    if (start > end) {
      return res.status(400).json({ message: "startDate must be before endDate" });
    }

    const query = {
      createdAt: {
        $gte: start,
        $lte: end
      }
    };

    if (status && status !== "All") {
      query.status = status;
    }

    const request_items = await PurchaseOrder.find(query)
      .populate("staff", "name Department email")
      .lean();
    if (filename && typeof filename==="string"){

      const sanitizedFileName = filename.replace(/[^a-zA-Z0-9-_]/g, '_');
      const timestamp = Date.now();
      
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${sanitizedFileName}-${timestamp}.xlsx`);
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Purchase Requests');
    
    // Define headers
    worksheet.columns = [
      { header: "Request Title", key: "title", width: 20 },
      { header: "Ordered By", key: "orderedBy", width: 20 },
      { header: "Email", key: "email", width: 30 },
      { header: "Product Name", key: "productName", width: 20 },
      { header: "Product Quantity", key: "productQuantity", width: 20 },
      { header: "Product Price", key: "productPrice", width: 20 },
      { header: "Urgency", key: "urgency", width: 20 },
      { header: "Status", key: "status", width: 20 },
      { header: "Department", key: "department", width: 20 },
      { header: "Date Created", key: "createdAt", width: 20 },
    ];

    // Add rows for each product in each request
    request_items.forEach((item) => {
      
      if (item.products && item.products.length > 0) {
        item.products.forEach((product) => {
          
          worksheet.addRow({
            title: item.Title,
            orderedBy: item.staff?.name || '',
            email: item.staff?.email || '',
            productName: product.name || '',
            productQuantity: product.quantity || 0,
            productPrice: product.price || 0,
            urgency: item.urgency,
            status: item.status,
            department: item.staff?.Department || '',
            createdAt:item.createdAt instanceof Date
            ? item.createdAt.toISOString().slice(0, 10)
            : (item.createdAt?.slice(0, 10) || '')
          });
          console.log("created AT:",item.createdAt)
        });
      } else {
        // Add row even if no products (with empty product fields)
        worksheet.addRow({
          title: item.Title,
          orderedBy: item.staff?.name || '',
          email: item.staff?.email || '',
          productName: '',
          productQuantity: '',
          productPrice: '',
          urgency: item.urgency,
          status: item.status,
          department: item.staff?.Department || '',
          createdAt:item.createdAt instanceof Date
            ? item.createdAt.toISOString().slice(0, 10)
            : (item.createdAt?.slice(0, 10) || '')
        });
      }
    });

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error exporting orders:", error);
    res.status(500).json({ message: "Server error during export" });
  }
});
router.put("/:id/approve", auth, async (req, res) => {
  const { id: orderId } = req.params;
  const { adminName ,comment} = req.body;
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
      comment:comment,
      timestamp: new Date()
    };
    order.Approvals.push(newApproval);

    const prev_Request=await order.save();
    RequestActivity(prev_Request._id)
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
  const { adminName, comment } = req.body;
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
      comment:comment,
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

router.put("/:id/completed",auth,async(req,res)=>{
  try{
    const { id: orderId } = req.params;

    const user=req.user;

    if (!user.canApprove){
      return res.status(403).json({message:"you are not authorized"})

    }
     const order = await PurchaseOrder.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    order.status="Completed"
    await order.save()
    res.status(200).json({message:"request completed"})



  }catch(error){
    console.error("Error completing order:", error);
    res.status(500).json({ message: "Error processing completion", error });
  


  }
})
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