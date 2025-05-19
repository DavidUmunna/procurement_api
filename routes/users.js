const {Router}=require('express')
const User=require('../models/users_');
const users_ = require('../models/users_');
const bcrypt=require("bcrypt")

const router=Router()

router.get("/", async (req, res) => {
  try {
    const user_data = await User.find()
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
router.get("/:email", async (req, res) => {
  try {
    const {email}=req.params
    console.log(email)
    const user_data = await User.find({email:email})//.select("-password")
    if (user_data){
      res.status(200).json({success:true ,message:"user exists"});

    }else{
      res.status(404).json({message:"user does not exist"})
    }
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
router.post('/', async (req, res) => {
  try {
    const can_approve_roles = ["procurement_officer", "human_resources", "internal_auditor", "global_admin","waste_mnagement",
      "PVT","Environmental_lab","Financial_manager","accounts"];
    const { name, email, password, Department, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const new_user = new User({
      name,
      email,
      password: hashedPassword, //assign the hashed password
      Department,
      role,
      canApprove: can_approve_roles.includes(role) // assign this directly
    });

    await new_user.save();
    res.status(201).json(new_user);

  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Error: User not created", error: error.message });
  }
});


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
  const { email, newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ message: "New password is required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({success:false, message: "User not found" });
    }

    // ✅ Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // ✅ Save the hashed password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({success:true, message: "Password updated successfully" });
  } catch (error) {
    console.error("from update password:",error)
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.put("/:id/updateuser",async(req,res)=>{
  try{
    const {Department,canApprove,name,password}=req.body
    const {id}=req.params
    const user_update=await User.findById(id)
    if (!user_update) {
      return res.status(404).json({ message: "User not found" });
    }
    
    console.log("these are some values",canApprove,Department)
    
    if (Department){
      user_update.Department=Department
    }
    if (canApprove){
      user_update.canApprove=canApprove
    }
    if (name){
      user_update.name=name
    }
    if (typeof password === 'string' && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      User.password = hashedPassword;
    }

    await user_update.save()
    res.status(200).json({message:"user details updated successfully",data:user_update})

  }catch(error){
    console.error("this error originated from users PUT:",error)
    res.status(500).json({message:"server error"})
  }
})
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