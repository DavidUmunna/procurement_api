const auth = require("./check-auth");
const express=require("express")

const router=express.Router()
router.get("/", auth, (req, res) => {
  res.json({
    authenticated: true,
    message: "You have access to this protected route",
    user: req.user,
  });
});

module.exports=router