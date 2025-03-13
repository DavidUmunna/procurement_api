
const {Schema, model}=require('mongoose')
const timestamp=require('timestamp')


const SigninSchema = new Schema({
  
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true,select:true },

}, { timestamps: true });

SigninSchema.plugin(timestamp);




module.exports=model("signin", SigninSchema);
