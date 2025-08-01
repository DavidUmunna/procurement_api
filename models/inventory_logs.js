const mongoose=require("mongoose")

const {Schema}=mongoose


const InventoryLogsSchema= new Schema({
    Staff_Name:{
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
    },
    category:{
        type:String,
        
        enum: {
        values: ['procurement_items','lab_items',"HSE_materials","Office_items"],
        message: 'Invalid category'
        }
    },
    Department:{
        type:String,
        
        enum:{
            values:["waste_management_dep","PVT","Environmental_lab_dep","accounts_dep","Human resources","Administration","IT","HSE_dep","Procurement_department","Contracts_Department","BD_Department","Engineering_Department"],
            message:"Department is invalid"
        }
    }


},{timestamps:true})

module.exports=mongoose.model("InventoryLogs",InventoryLogsSchema)