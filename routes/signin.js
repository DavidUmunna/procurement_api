const { Router } = require("express");
const mongoose = require("mongoose");
const PurchaseOrder = require("../models/PurchaseOrder");
const users=require("../models/users_")
const bcrypt=require("bcrypt")
const signin=require("../models/sign_in")
const jwt=require("jsonwebtoken")
require("dotenv").config({ path: __dirname + "/.env" });




const router = Router();



router.post('/', async (req, res) => {
    try {
        const { username, password } = req.body;
        const email = username; // Alias, but unnecessary

        // Find user once (avoiding redundant queries)
        const user_data = await users.findOne({ email });

        // If user doesn't exist, return error
        if (!user_data) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Compare hashed passwords
        const isMatch = await users.exists({ password: password });
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check if user is already logged in
        const login_exists = await signin.exists({ email });
        if (login_exists) {
            return res.status(401).json({ success: false, message: 'User already logged in' });
        }

        // Store login session
        const token = jwt.sign({ username: users.username }, process.env.JWT_SECRET ||"pedro1234", { expiresIn: "1h" });
        return res.json({
            success:true, 
            message: "Login successful",
            token,
            name: user_data.name,
            email: user_data.email,
            role: user_data.role,
            imageurl: user_data.imageurl
         });
        
        // Return user data
       
        

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.post("/logout", async (req, res) => {
    try {
        const token = req.header("Authorization")?.split(" ")[1];
        if (token) {
            blacklistedTokens.push(token);
        }
        res.json({ message: "Logout successful" });
    } catch (error) {
        res.status(500).json({ error: "Server error during logout" });
        console.error(error)
    }
});


router.delete("/", async (req, res) => {
  try {
    await signin.deleteMany({});
    res.json({ message: "All signed out deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting all orders", error });
  }
});


module.exports=router