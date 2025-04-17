const auth = require("./check-auth");
const express=require("express")
const user_=require("../models/users_")


const router=express.Router()
router.get("/", auth, async (req, res) => {
  const email=req.user.email
  const User=await user_.find({email:email})
  const approval_rights=User.canApprove
  res.json({
    authenticated: true,
    message: "You have access to this protected route",
    user: {...req.user,approval_rights}
  });
});

module.exports=router