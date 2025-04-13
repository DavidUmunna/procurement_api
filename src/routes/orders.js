const { Router } = require("express");
const mongoose = require("mongoose");
const PurchaseOrder = require("../models/PurchaseOrder");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const file=require("./fileupload")
const auth=require("./check-auth")
const uploadDir = path.join(__dirname, "../uploads");

const router = Router();





// Get all purchase orders
router.get("/", auth,async (req, res) => {
  try {
    console.log(req.user)
    const isAdmin= req.user.role==="admin"
    const orders = await PurchaseOrder.find()
      .populate("supplier", "name email phone")
      .populate("products", "name quantity price")
      
    const response=(orders.map((order=>{
      const plainOrder=order.toObject()
      if(!isAdmin){
        delete  plainOrder.Approvals
      }
      return plainOrder
    })))
    res.json(response);
  } catch (error) {
    console.error(error)
    //res.status(500).json({ message: "Server error", error });
  }
});

router.get("/:email", auth,async (req, res) => {
  try {
      const { email } = req.params;
      const isAdmin= req.user.role==="admin"
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    

    // Fetch user orders
    const userRequests = await PurchaseOrder.find({ email });
    
    const response=(userRequests.map((order=>{
      if(!isAdmin){
        delete  order.Approvals
      }
      return order
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


// Create a new purchase order
router.post("/",  async (req, res) => {
  try {
    const { supplier, orderedBy, products,email,filenames, urgency, remarks } = req.body;
    
    //console.log(req.body);

    // Ensure products is an array and destructure its fields
    if (!Array.isArray(products)) {
      return res.status(400).json({ error: "Products must be an array" });
    }

    

   

    const newOrder = new PurchaseOrder({
      supplier,
      orderedBy,
      email,
      products,
      urgency,
      filenames,
      remarks
      

    });
    console.log(newOrder)

    await newOrder.save();
    res.status(200).json({ newOrder });
  } catch (error) {
    console.error("Error creating purchase order:", error);
    res.status(400).json({ message: "Error creating purchase order", error });
  }
});
router.put("/:id/approve",async (req, res) => {
  const { id:orderId } = req.params;
  const { adminName} = req.body; // Pass the admin's name in the request body

  try {
      console.log("orderid",orderId)
      console.log("adminname",adminName)
      const order = await PurchaseOrder.findById({_id:orderId});
      if (!order) {
          return res.status(404).json({ message: "Order not found" });
      }

      if (!order.Approvals.includes(adminName)) {
          order.Approvals.push(` ${adminName}`);
          await order.save();
          return res.status(200).json({ message: "Order approved", order });
      } else {
          return res.status(400).json({ message: "Admin has already approved this order" });
      }
  } catch (error) {
      res.status(500).json({ message: "Server error", error });
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