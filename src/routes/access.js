const auth = require("../middleware/check-auth");
const express=require("express")
const user_=require("../models/users_")


const router=express.Router()
router.get("/", auth, async (req, res) => {
  const email=req.user.email
  const User=await user_.find({email:email})
  const approval_rights=User.canApprove
  const created_date=User.createdAt
  const userId=User._id
  const arr=[approval_rights,created_date,userId]
  res.json({
    authenticated: true,
    message: "You have access to this protected route",
    user: {...req.user,arr}
  });
});

module.exports=router