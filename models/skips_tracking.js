


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
    WasteStream:{type:String,required:true,enum:["WBM_Affluent","OBM_Cutting","WBM_cutting", "OBM_Affluent","Sludge"]},
    SourceWell:{type:String,required:true},
    DispatchManifestNo:{type:String},
    DispatchTruckRegNo:{type:String},
    DriverName:{type:String},
    DeliveryOfEmptySkips:{type:Date,required:true},
    DemobilizationOfFilledSkips:{type:Date},
    DateFilled:{type:Date},
    lastUpdated: {
    type: Date,
    default: Date.now
    },

},{timestamps:true})
SkipsTrackingSchema.index({ createdAt: 1 });

const SkipTracking=mongoose.model("Skipstracking",SkipsTrackingSchema)

module.exports=SkipTracking