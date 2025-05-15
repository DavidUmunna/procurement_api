const mongoose=require("mongoose")

const InvoicingSchema=mongoose.Schema({
    SkipRentalDuration:{type:Number,required:true},
    SkipRentalCharge:{type:Number,required:true},
    MobilizationCharge:{type:Number,required:true},
    DemobilizationCharge:{type:Number,required:true},
    Sum:{type:Number,required:true}
    
})

const Invoicing=mongoose.model("Invoicing",InvoicingSchema)
InvoicingSchema.pre('save', function (next) {
    this.Sum = this.SkipRentalCharge + this.MobilizationCharge + this.DemobilizationCharge;
    next();
  });
  

module.exports=Invoicing