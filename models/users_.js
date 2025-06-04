
const {Schema, model}=require('mongoose')
const timestamp=require('timestamp')


const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique:true},
  password: { type: String, required: true,select:true },
  Department:{type:String, enum:["waste_management_dep","PVT","Environmental_lab_dep","accounts_dep","Human resources","Administration","IT","HSE_dep","Procurement_department","Contracts_Department","BD_Department"]},
  role: { type: String, enum: ["admin", "procurement_officer","human_resources","staff",
    "internal_auditor","Financial_manager","global_admin","waste_management_manager","waste_management_supervisor","PVT_manager","lab_supervisor","Environmental_lab_manager","accounts","Director","HSE_officer","Documentation_officer","Contracts_manager","BD_manager"], default: "staff" },
  canApprove: {
      type: Boolean,
      default: false
    },
  resetToken:String,
  resetTokenExpiration:Date
  
}, { timestamps: true });

UserSchema.plugin(timestamp);




module.exports=model("user", UserSchema);
