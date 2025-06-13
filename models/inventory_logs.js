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
        required: [true, 'Category is required'],
        enum: {
        values: ['procurement_items','lab_items',"HSE_materials"],
        message: 'Invalid category'
        }
    } 


},{timestamps:true})

module.exports=mongoose.model("InventoryLogs",InventoryLogsSchema)