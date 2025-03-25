const { Router } = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AdminUser = require('../models/users_');

const router = Router();

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await AdminUser.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
      console.log(user.password)
    const isMatch = await user.exists({password:password});
    
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
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