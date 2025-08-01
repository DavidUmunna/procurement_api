
// Core modules
const path = require("path");
const csrf=require("csurf")
// Third-party packages
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet=require("helmet")
// Custom modules
const connectDB = require("./db");

// Route imports
const uploadRoutes = require("./routes/fileupload");
const skiptrackRoutes=require("./routes/skips_route")
const departmentRoutes = require("./routes/Department_route");
const companyDataRoutes = require("./routes/CompanyDataRoute");
const supplierRoutes = require("./routes/suppliers");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const userRoutes = require("./routes/users");
const signinRoutes = require("./routes/signin");
const authCheckRoutes = require("./middlewares/check-auth");
const adminUserRoutes = require("./routes/admin_user");
const accessRoutes = require("./routes/access");
const adminTestRoutes = require("./routes/admin_test");
const taskRoutes = require("./routes/task");
const assetsRoutes = require("./routes/assets_route");
const InventoryRoute=require("./routes/Inventoy_route")
const activityroute=require("./routes/activityroute")
const testDBRoute = require("./routes/test-db");
const inventorylogs=require("./routes/inventorylogs_route")
const roles_departments=require("./routes/roles&departments")
const monitoring=require("./routes/Monitoring_route")
const Scheduling=require("./controllers/SchedulingRoutes")
// Initialize Express
const app = express();

// Allowed origins for CORS
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:5000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://192.168.0.185:3000",
  "http://192.168.56.1:3000",
  "http://localhost:3001",
  "https://8a13-102-90-79-163.ngrok-free.app",
  "https://reqmanusers.netlify.app/",
  "https://resourceman.netlify.app",
  "http://194.163.137.35:5000",
  "http://194.163.137.35",
  "https://erp.haldengroup.ng"
];

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
const csrfProtection=csrf({cookie:true})

// CORS setup
app.use(
  cors({
    origin: [
  "http://localhost:3000",
  "http://127.0.0.1:5000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://localhost:5000",
  "http://192.168.137.108:3000",
  "http://192.168.137.108:5000",
  "https://erp.haldengroup.ng"
  ],
    credentials: true,
  })
);
app.use(testDBRoute);



// Static file serving
app.use("/uploads", express.static(path.join("uploads")));

// Connect to database
connectDB();

// Route usage
app.use("/api/supplier", supplierRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/signin", signinRoutes);
app.use("/api/check-auth", authCheckRoutes);
app.use("/api/fileupload", uploadRoutes);
app.use("/api/admin-user", adminUserRoutes);
app.use("/api/access", accessRoutes);
app.use("/api/admin_test", adminTestRoutes);
app.use("/api/department", departmentRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/assets", assetsRoutes);
app.use("/api/companydata", companyDataRoutes);
app.use("/api/inventory", InventoryRoute);
app.use("/api/inventory/activities", activityroute);
app.use("/api/skiptrack", skiptrackRoutes);
app.use("/api/inventorylogs",inventorylogs)
app.use("/api/roles&departments",roles_departments)
app.use("/api/monitoring",monitoring)
app.use("/api/scheduling",Scheduling)


app.use((req, res, next) => {
  const csrfExcludedPaths = [
    "/api/admin-user/login",
    "/api/fileupload",
    "/api/companydata",
    "/api/orders/memo",
    "/api/disbursement-schedules/:id/submit"
    
  ];

  const isUnsafeMethod = ["POST", "PUT", "DELETE"].includes(req.method);
  const isExcludedPath = csrfExcludedPaths.includes(req.path);

  if (isUnsafeMethod && !isExcludedPath) {
    console.log("this csrf middle was hit before :",req.originalUrl)
    return csrfProtection(req, res, next);
  }
  next();
})

app.get("/api/csrf-token", csrfProtection, (req, res) => {
  res.cookie("XSRF-TOKEN", req.csrfToken());
  console.log(res.cookie)
  res.status(200).json({ message: "CSRF token set" });
});
// Health check route
app.get("/", (req, res) => {
  try {
    console.log("✅ Server is running and ready to accept requests!");
    res.status(200).send("Welcome to the Procurement API!");
  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).send("Server error");
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`🚀 Server running on port ${PORT}`)
);


module.exports=app