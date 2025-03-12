const {Router}=require('express')
const User=require('../models/users_')

const router=Router()

router.get("/", async (req, res) => {
  try {
    const user_data = await User.find()//.select("-password")
    res.json(user_data);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
//create the user
router.post('/',async (req,res)=>{
    try{
        const {name, email, password, role}= req.body;
        
        const new_user=new User({name,email, password, role,imageUrl});
        console.log(new_user)
        await new_user.save()
        res.status(201).json(new_user)


    }catch (error) {
      res.status(400).json({ message: "Error User not created" });
      console.error(error)
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