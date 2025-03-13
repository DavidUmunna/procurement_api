const { Router } = require("express");
const mongoose = require("mongoose");
const PurchaseOrder = require("../models/PurchaseOrder");
const users=require("../models/users_")
const bcrypt=require("bcrypt")
const signin=require("../models/sign_in")



const router = Router();
router.get("/", async (req, res) => {
  try {
    const user_data = await users.findOne({email})//.select("-password")
    res.json(user_data);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


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
        const new_log_in = new signin({ email, password });
        await new_log_in.save();

        // Return user data
        return res.json({
            success: true,
            message: 'Login successful',
            name: user_data.name,
            email: user_data.email,
            role: user_data.role,
            imageurl: user_data.imageurl
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.delete("/:id", async (req, res) => {
  try {
    const deletedOrder = await signin.findByIdAndDelete(req.params.id);
    if (!deleteduser) {
      return res.status(404).json({ message: "User not signed in" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting order", error });
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