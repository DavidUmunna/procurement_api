const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

router.get("/", (req, res) => {
    const token = req.cookies?.authToken; // Ensure `req.cookies` exists

    if (!token) {
        return res.status(401).json({ authenticated: false, message: "No token provided" });
    }

    try {
        
        res.json({ authenticated: true });
    } catch (error) {
        res.clearCookie("authToken"); // Clear expired/invalid token
        return res.status(401).json({ authenticated: false, message: "Invalid or expired token" });
    }
});

module.exports = router;
