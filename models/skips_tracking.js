const mongoose=require("mongoose")



const SkipsTrackingSchema=mongoose.Schema({
    skip_id:{type:String,required:true},
    DeliveryWaybillNo:{type:Number},
    DateMobilized:{type:Date},
    DateReceivedOnLocation:{type:Date},
    SkipsTruckRegNo:{type:String},
    SkipsTruckDriver:{type:String},
    Quantity: {
        value: { type: Number,  }, // e.g., 1500
        unit: {
          type: String,
          
        }
      },
    WasteStream:{type:String,required:true,enum:["WBM_Affluent","OBM_Cutting","WBM_cutting", "OBM_Affluent","Sludge","Others"]},
    WasteSource:{type:String,required:true},
    DispatchManifestNo:{type:String},
    WasteTruckRegNo:{type:String},
    WasteTruckDriverName:{type:String},
    
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