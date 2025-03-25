
const {Schema, model}=require('mongoose')
const timestamp=require('timestamp')


const AdminUserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true,select:true },
  role: { type: String, enum: ["admin", "procurement_officer","staff"], default: "staff" },

}, { timestamps: true });

AdminUserSchema.plugin(timestamp);




module.exports=model("Admin", AdminUserSchema);
