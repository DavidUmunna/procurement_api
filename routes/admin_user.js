const {Router}=require('express')
const AdminUser=require('../models/admin_users')

const router=Router()

router.get("/", async (req, res) => {
  try {
    const AdminUserdata = await AdminUser.find()//.select("-password")
    res.json(user_data);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
//create the user
router.post('/',async (req,res)=>{
    try{
        const {name, email, password, role}= req.body;
        
        const new_user=new AdminUser({name,email, password, role});
        console.log(new_user)
        await new_user.save()
        res.status(201).json(new_user)


    }catch (error) {
      res.status(400).json({ message: "Error User not created" });
      console.error(error)
    }
})
// Adjust the path based on your project structure


router.get("/:email",async(req,res)=>{
    const {email}=req.body
    try{
        const user = await AdminUser.findOne({ email });
        res.status(200).json({message:"user is valid"})
    }catch(error){
        res.status(404).json({message:"user not found"},error)
    }
})
// Update password using email
router.put("/:email", async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: "Email and new password are required" });
  }

  try {
    const user = await AdminUser.findOne({ email });

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
      const deleteuser=await AdminUser.findByIdAndDelete(req.params.id)
      if (!deleteuser){
        return res.status(404).json({ message: "User not found" });
      }res.json({ message: "Order deleted successfully" });
      

  }catch(err){
    res.status(500).json({ message: "Error deleting User", err });
  }
})

module.exports=router;