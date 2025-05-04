const {Router}=require('express')
const User=require('../models/users_');
const users_ = require('../models/users_');

const router=Router()

router.get("/", async (req, res) => {
  try {
    const user_data = await User.find()//.select("-password")
    const response=(user_data.map((user=>{
      const plainUser=user.toObject()
      
        delete  plainUser.password
      
      return plainUser
    })))
    res.json(response);
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const user_data = await User.findById(req.params.id)//.select("-password")
    res.json(user_data);
  } catch (error) {
    res.status(500).json({ message: "an error occured while getting user" });
  }
});
router.get("/:email", async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Fetch user orders
    const userRequests = await users_.find({ email });

    if (!userRequests.length) {
      return res.status(404).json({ message: "No user found for this email" });
    }

    res.status(200).json(userRequests);
  } catch (error) {
    console.error("Error fetching user :", error);
    res.status(500).json({ error: "Failed to retrieve user" });
  }
});
//create the user
router.post('/',async (req,res)=>{
    try{
        const can_approve_roles=[ "procurement_officer","human_resources","internal_auditor","global_admin"]
        const {name, email, password,Department, role}= req.body;
        
        
        const new_user=new User({name,email, password,Department, role});
        if (can_approve_roles.includes(role)){
                new_user.canApprove=true
        }

        console.log(new_user)
        await new_user.save()
        res.status(201).json(new_user)


    }catch (error) {
      res.status(400).json({ message: "Error User not created" });
      console.error(error)
    }
})

router.get("/:email", async (req, res) => {
  try {
      const { email } = req.params; // Get email from URL params
      const user = await User.findOne({ email });

      if (user) {
          return res.status(200).json({ message: "User is valid", user });
      } else {
          return res.status(404).json({ message: "User not found" });
      }
  } catch (error) {
      console.error("Error fetching user:", error);
      return res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/:email", async (req, res) => {
  const {  email,newPassword } = req.body;

  if ( !newPassword) {
    return res.status(400).json({ message: "Email and new password are required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
//delete User
router.delete('/:id',async (req,res)=>{
  try{
      const deleteuser=await User.findByIdAndDelete(req.params.id)
      if (!deleteuser){
        return res.status(404).json({ message: "User not found" });
      }res.json({ message: "Order deleted successfully" });
      

  }catch(err){
    res.status(500).json({ message: "Error deleting User", err });
  }
})

module.exports=router;