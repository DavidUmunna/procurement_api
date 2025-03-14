const { Router } = require("express");
const mongoose = require("mongoose");
const PurchaseOrder = require("../models/PurchaseOrder");
const users=require("../models/users_")
const bcrypt=require("bcrypt")
const signin=require("../models/sign_in")
const jwt=require("jsonwebtoken");
const sign_in = require("../models/sign_in");
require("dotenv").config({ path: __dirname + "/.env" });




const router = Router();
const authenticateToken = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1]; // Extract Bearer token

    if (!token) return res.status(401).json({ error: "Access Denied" });

    jwt.verify(token, process.env.JWT_SECRET||"pedro1234", (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid Token" });

        req.user = user; // Attach user data to request
        next();
    });
};

router.get('/api/user',authenticateToken,async(req,res)=>{
    try{
        const user = users.find(u => u.id === req.user.id); // Fetch user from DB
        if (!user) return res.status(404).json({ error: "User not found" });
    
        res.json(user);

    }catch(err){

    }
  
})
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

      
        

        // Store login session
        const token = jwt.sign({ username: users.username }, process.env.JWT_SECRET ||"pedro1234", { expiresIn: "1h" });
        res.setHeader("Authorization", `Bearer ${token}`);
        console.log(res.headersSent)

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

        if (!token) {
            return res.status(400).json({ error: "No token provided" });
        }

        // Verify the token to extract user ID
        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(401).json({ error: "Invalid token" });
            }

            const userId = decoded.id; // Assuming JWT contains user ID

            // Delete user session from the database (if using session-based authentication)
            await sign_in.findOneAndDelete({ _id: userId });

            // Blacklist the token (temporary storage, better to use Redis)
            blacklistedTokens.push(token);

            res.json({ message: "Logout successful" });
        });
    } catch (error) {
        console.error("Logout Error:", error);
        res.status(500).json({ error: "Server error during logout" });
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