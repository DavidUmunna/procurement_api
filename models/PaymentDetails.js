const mongoose=require("mongoose")


const PaymentDetaislsSchema=new mongoose.Schema({
    scheduleId:{type:mongoose.Schema.Types.ObjectId},
    Beneficiary:{type:String},
    AccountNumber:{type:Number,},
    Bank:{type:String}
},{timestamps:true})

module.exports=mongoose.model("paymentdetails",PaymentDetaislsSchema)