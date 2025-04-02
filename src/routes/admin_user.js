const { Router } = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AdminUser = require('../models/users_');

const router = Router();

// Login route
router.post('/login', async (req, res) => {
 

  try {

     const { username, password } = req.body;
     const email=username
    const user_data = await AdminUser.findOne({ email });
    if (!user_data) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
      
    const isMatch = await AdminUser.exists({password:password});
    
    if (!isMatch) {
      return res.status(401).json({success:false, message: "Invalid email or password" });
    }

    if (user_data.role !== "admin") {
      return res.status(403).json({success:false, message: "Access denied. Admins only." });
    }

    const token = jwt.sign({ userId: user_data._id,email: user_data.email, role: user_data.role,name: user_data.name }, process.env.JWT_SECRET|| "pedro1234", {
      expiresIn: "1h"
    });

    res.cookie("authToken",token,{
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 1000, // 1 hour
      sameSite: "Lax",
  },
  
  )

  return res.json({
      success:true, 
      message: "Login successful",
      token:token,
      user:{name: user_data.name,
      email: user_data.email,
      role: user_data.role}
      
      
   });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;