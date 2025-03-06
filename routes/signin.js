const { Router } = require("express");
const mongoose = require("mongoose");
const PurchaseOrder = require("../models/PurchaseOrder");


const router = Router();

router.post('/signin', (req, res) => {
    const { username, password } = req.body;

    // Dummy authentication (replace with database check)
    if (username === 'admin' && password === 'password') {
        return res.json({ success: true, message: 'Login successful' });
    } else {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});


module.exports=router