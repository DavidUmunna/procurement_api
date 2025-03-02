const express=require('express')
const cors=require('cors')
const connectDB =require("./db") ;

require("dotenv").config();

// Initialize Express
const app = express();
app.use(express.json());
app.use(cors());

// Connect to Database
connectDB();

app.use("/api/suppliers", require("./routes/suppliers"));
app.use("/api/products", require("./routes/products"));
app.use("/api/orders", require("./routes/orders"));


// Sample API route
app.get("/", (req, res) => {
  res.send("Hello from Express API!");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
