const express=require("express")
const auth=require("../../middlewares/check-auth")
const createApprovalOTP=require("../../controllers/v1.controllers/OTPcreation")
const router=express.Router()


router.post("/:id/send-otp", auth, createApprovalOTP)


module.exports=router;