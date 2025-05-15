const mongoose=require("mongoose")
const timestamp = require("timestamp")



const SkipsTrackingSchema=mongoose.Schema({
    skip_id:{type:String,required:true},
    DeliveryWaybillNo:{type:Number},
    Quantity: {
        value: { type: Number,  }, // e.g., 1500
        unit: {
          type: String,
          enum: ['kg', 'tonne'],
          
        }
      },
    WasteStream:{type:String,required:true,enum:["WBM","OBM","WBM_cutting", "OBM_Affluent"]},
    SourceWell:{type:String,required:true},
    DispatchManifestNo:{type:String},
    DispatchTruckRegNo:{type:String},
    DriverName:{type:String},
    DeliveryOfEmptySkips:{type:Date,required:true},
    DemobilizationOfFillledSkips:{type:Date},
    DateFilled:{type:Date},
    lastUpdated: {
    type: Date,
    default: Date.now
    },

},{timestamps:true})

const SkipTracking=mongoose.model("Skipstracking",SkipsTrackingSchema)

module.exports=SkipTracking