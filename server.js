const express=require('express')
const cors=require('cors')
const connectDB =require("./db") ;

require("dotenv").config();

// Initialize Express
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
// Connect to Database
connectDB();

//import routes
app.use("/api/suppliers", require("./routes/suppliers"));
app.use("/api/products", require("./routes/products"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/users", require('./routes/users') )
app.use("/api/signin",require("./routes/signin"))




// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
