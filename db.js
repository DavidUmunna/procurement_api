const mongoose = require("mongoose");
const circuitBreaker=require("opossum")
const XLSX = require("xlsx");
const orderModel = require("./models/PurchaseOrder");

require("dotenv").config();
URI="mongodb+srv://chimaumunna98:Chimaroke135@unique.xxejy.mongodb.net/?retryWrites=true&w=majority&appName=Unique"

const options={
  timeout:3000,
  errorthresholdpercentage:50,
  resettimeout:5000
}
const MONGO_URI = process.env.MONGO_URI ||"mongodb://127.0.0.1:27017/procurement" ;
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).then(console.log("✅ MongoDB connected successfully")).catch((err)=>console.log(err))
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1); // Exit process with failure
  }
};


const breaker=new circuitBreaker(connectDB,options)
breaker.fallback(() => ({ message: "Service is down. Please try again later." }))

breaker.fire().then((response)=>console.log(response))
.catch(err=>console.error("circuit breaker triggered",err))

const exporttoExcel=async()=>{
  try{
    const orders=await orderModel.find({}).lean()
    const formattedData = orders.map(item => ({
      orderNumber: item.orderNumber || "N/A",
      supplier: item.supplier || "halden",
      email: item.email || "N/A",
      
    status: item.status || "N/A",
    orderedBy: item.orderedBy || "N/A",
    urgency:item.urgency || "N/A",
    remark:item.remarks || "N/A"
    
    }));
    const productData=orders.flatMap(order=>
      order.products.map(item=>({
        name:item.name||"N/A",
        quantity:item.quantity||"N/A",
        price:item.price||"N/A"
      }))
    )
    
    const wb=XLSX.utils.book_new()
    const ws=XLSX.utils.json_to_sheet(formattedData)
    const ws1=XLSX.utils.json_to_sheet(productData)
    XLSX.utils.book_append_sheet(wb,ws,"orders")
    XLSX.utils.book_append_sheet(wb,ws1,"productdata")
    XLSX.writeFile(wb,"orders.xlsx")

   

    console.log("orders exported to excel")
  }catch(err){
    console.error("Error Exporting Data",err)
  }
  
}
exporttoExcel()

module.exports = connectDB;
