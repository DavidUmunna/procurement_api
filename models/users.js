
const {Schema, model}=require('mongoose')
const timestamp=require('timestamp')
const bcrypt=require("bcrypt")

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "procurement_officer","normal_user"], default: "staff" },
}, { timestamps: true });

UserSchema.plugin(timestamp);
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});


module.exports=model("User", UserSchema);
