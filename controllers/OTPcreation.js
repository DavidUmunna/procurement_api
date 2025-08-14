const OTP = require("../models/OTP");
const crypto = require("crypto");
const {sendOtpEmail}=require("./notification")
async function createApprovalOTP(req, res) {
  try {
    const otpCode = crypto.randomInt(100000, 999999).toString();

    await OTP.create({
      userId: req.user.userId,
      code: otpCode,
      purpose: "Approval",
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes from now
    });

    await sendOtpEmail(req.user.email, otpCode);

    // ✅ Send the response to the client
    return res.status(200).json({
        success:true,
      message: "OTP sent successfully to your email.",
      // Remove the OTP in production if it's sensitive
      
    });
  } catch (error) {
    console.error("Error creating approval OTP:", error);
    return res.status(500).json({success:false, message: "Failed to send OTP" });
  }
}


module.exports=createApprovalOTP;
