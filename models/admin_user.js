
const {Schema, model}=require('mongoose')
const timestamp=require('timestamp')


const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true,select:true },
  role: { type: String, enum: ["admin", "procurement_officer","staff"], default: "staff" },

}, { timestamps: true });

UserSchema.plugin(timestamp);




module.exports=model("user", UserSchema);
