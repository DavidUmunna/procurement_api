
const {Schema, model}=require('mongoose')
const timestamp=require('timestamp')


const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique:true,match:/.+\@.\..+/},
  password: { type: String, required: true,select:true },
  role: { type: String, enum: ["admin", "procurement_officer","human_resocurces","staff",
    "internal_auditor","global_admin","waste_management","PVT","lab","accounts"], default: "staff" },
  canApprove: {
      type: Boolean,
      default: false
    }
}, { timestamps: true });

UserSchema.plugin(timestamp);




module.exports=model("user", UserSchema);
