const express = require("express");
const router = express.Router();
const orderController = require("../../controllers/v2.controllers/orders.controllers");
const authenticate = require("../../middleware/auth.middleware"); // assuming you have auth middleware
const ordersRateLimiter=require("../../middlewares/ordersRateLimiter")

// All routes require the user to be authenticated
router.use(authenticate);

// Get all orders
router.get("/",ordersRateLimiter, orderController.getAllOrders);

// Get orders by department (query param ?Department=)
router.get("/department", orderController.getDepartmentOrders);

// Get orders for a specific staff member by ID
router.get("/staff/:id", orderController.getStaffOrders);

// Get all orders for department display
router.post("/memo", orderController.createMemo);
router.get("/display/department", orderController.getAllOrdersForDepartment);

// Get departmental display orders
router.get("/display/departmental", orderController.getDepartmentDisplayOrders);

// Get staff display orders
router.get("/display/staff", orderController.getStaffDisplayOrders);

// Create a new order
router.post("/", orderController.createOrder);
router.put("/:id/completed", auth, ordersController.completeOrder); //complete an order
router.put("/:id/approve", auth, orderController.approveOrderController);


router.put("/:id", auth, orderController.updateStatus);//Overall update
router.delete("/:id", auth, orderController.deleteOrder); 
router.delete("/", auth, orderController.deleteAllOrders);
// Export orders
router.post("/export", orderController.exportOrder);

module.exports = router;
