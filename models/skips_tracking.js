const mongoose=require("mongoose")
const timestamp = require("timestamp")



const SkipsTrackingSchema=mongoose.Schema({
    skip_id:{type:String,require:true},
    DeliveryWaybill:{type:Number, required:true},
    Quantity:{type:String,required:true},
    WasteStream:{type:String,required:true,enum:["WBM","OBM","WBM cutting", "OBM Affluent"]},
    SourceWell:{type:String,Required:true},
    DispatchManifest:{type:String,Required:true},
    DeliveryOfEmptySkips:{type:Date,required:true},
    DemobilizationOfFillledSkips:{type:Date},
    lastUpdated: {
    type: Date,
    default: Date.now
    },

},{timestamp:true})

const SkipTracking=mongoose.model("Skipstracking",SkipsTrackingSchema)

module.exports=SkipTracking