const { Router } = require("express");
const mongoose = require("mongoose");
const PurchaseOrder = require("../models/PurchaseOrder");
const users=require("../models/users_")
const bcrypt=require("bcrypt")



const router = Router();

router.post('/', async (req, res) => {
    try{
        const { username, password } = req.body;
        const username_exists=await users.exists({email:username})
        const password_exists=await users.exists({password:password})
    
        if (username_exists && password_exists) {
            return res.json({ success: true, message: 'Login successful' });
        } else {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    }catch(err){
        console.error(err)
    }
    
});


module.exports=router