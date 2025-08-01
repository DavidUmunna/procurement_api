const mongoose=require("mongoose")


const PaymentDetaislsSchema=new mongoose.Schema({
    Beneficiary:{type:String},
    AccountNumber:{type:Number,},
    Bank:{type:String}
},{timestamps:true})

module.exports=model("paymentdetails",PaymentDetaislsSchema)