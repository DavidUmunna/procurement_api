const mongoose=require("mongoose")

const {Schema}=mongoose


const InventoryLogsSchema= new Schema({
    Staff_name:{
        type:String,
    },
    quantity:{
        type:Number
    },
    inventory_item:{
        type:String,
    },
    purpose:{
        type:String
    },
    status:{
        type:String, enum:['pending','returned','completed']
    }


},{timestamps:true})

module.exports=mongoose.model("InventoryLogs",InventoryLogsSchema)