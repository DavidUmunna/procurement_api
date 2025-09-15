const express = require("express");
const router = express.Router();
const orderController = require("../../controllers/order.controller");
const authenticate = require("../../middleware/auth.middleware"); // assuming you have auth middleware

// All routes require the user to be authenticated
router.use(authenticate);

// Get all orders
router.get("/", orderController.getAllOrders);

// Get orders by department (query param ?Department=)
router.get("/department", orderController.getDepartmentOrders);

// Get orders for a specific staff member by ID
router.get("/staff/:id", orderController.getStaffOrders);

// Get all orders for department display
router.get("/display/department", orderController.getAllOrdersForDepartment);

// Get departmental display orders
router.get("/display/departmental", orderController.getDepartmentDisplayOrders);

// Get staff display orders
router.get("/display/staff", orderController.getStaffDisplayOrders);

// Create a new order
router.post("/", orderController.createOrder);

// Export orders
router.post("/export", orderController.exportOrder);

module.exports = router;
