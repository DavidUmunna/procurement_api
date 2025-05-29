const   { Schema, model } = require('mongoose');
const timestamps = require('timestamp');
const  User = require('./users_');

const PurchaseOrderSchema = new Schema({
  orderNumber: { type: String, unique: true, default: () => `PO-${Date.now()}` },
  Title:{type:String,required:false},
  Approvals: [{
    admin: String,      // e.g., "John Doe"
    status: String,   
    comment:String,  // e.g., "Approved" or "Rejected"
    timestamp: {        // When the action occurred
      type: Date,
      default: Date.now
    }
  }],

  products: [{name: { type: String, required: true }, 
  quantity:{ type:Number , required:true},
  price: { type: Number, required: true },
  }],
  staff: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    
  },
 
  filenames:{type:[String],default:[]},
  supplier: { type: String,  required: false },

  status: { type: String, enum: ["Pending", "Approved", "Copmpleted", "Rejected"], default: "Pending" },
  urgency:{type:String, enum:["VeryUrgent","Urgent","NotUrgent"],default:"NotUrgent"},
  
  remarks:{type:String,required:true}
}, { timestamps: true });

PurchaseOrderSchema.plugin(timestamps);

PurchaseOrderSchema.statics.countOrders = async function () {
  return await this.countDocuments();
};
PurchaseOrderSchema.pre('save', async function(next) {
  // If email is not already set
  if (!this.email) {
    try {
      // Assuming you have imported your User model
      const user = await User.findById(this._id);
      if (user) {
        this.email = user.email;
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});
PurchaseOrderSchema.set('toJSON',{
  transform:function(doc,ret){
    delete ret.Approvals;
    return ret
  }
})


module.exports = model("PurchaseOrder", PurchaseOrderSchema);