
const {Schema, model}=require('mongoose')
const timestamp=require('timestamp')


const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique:true},
  password: { type: String, required: true,select:true },
  Department:{type:String, enum:["waste_management_dep","PVT_dep","Environmental_lab_dep","accounts_dep","Human_Resources"]},
  role: { type: String, enum: ["admin", "procurement_officer","human_resources","staff",
    "internal_auditor","global_admin","waste_management","PVT","lab","accounts"], default: "staff" },
  canApprove: {
      type: Boolean,
      default: false
    }
}, { timestamps: true });

UserSchema.plugin(timestamp);




module.exports=model("user", UserSchema);
