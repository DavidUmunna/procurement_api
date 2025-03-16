const express=require('express')
const cors=require('cors')
const connectDB =require("./db") ;
const cookieparser=require('cookie-parser')

require("dotenv").config();
const allowedOrigins = ["http://localhost:3000", "http://localhost:3001"];
// Initialize Express
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(
    {
        origin:(origin, callback)=>{
            if (!origin || allowedOrigins.includes(origin)){
                callback(null,true)
            }else{
                callback(new Error("Not allowed by cors"))
            }
        },credentials:true,
    }
));
app.use(cookieparser())
// Connect to Database
connectDB();

//import routes
app.use("/api/suppliers", require("./routes/suppliers"));
app.use("/api/products", require("./routes/products"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/users", require('./routes/users') )
app.use("/api/signin",require("./routes/signin"))
app.use("/api/check-auth",require("./routes/check-auth"))




// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
