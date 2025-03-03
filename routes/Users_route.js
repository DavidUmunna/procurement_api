const {Router}=require('express')
const User=require('../models/users')

const router=Router()

router.get("/", async (req, res) => {
  try {
    const users = await User.find().populate("users");
    res.json(users);
   
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
//create the user
router.post('/',async (req,res)=>{
    try{
        const {name, email, password, role}= req.body;
        const new_user=new User({name,email, password, role});

        await new_user.save()
        res.status(201).json(new_user)


    }catch (error) {
      res.status(400).json({ message: "Error creating User" });
    }
})

module.exports=router;