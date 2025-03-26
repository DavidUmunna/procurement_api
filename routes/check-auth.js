const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

router.get("/", (req, res) => {
    
    
    
    try {
        const authheaders=req.headers.authorization

        if (!authheaders || !authheaders.startsWith("Bearer ")) {
        return res.status(401).json({ authenticated: true
            , message: "No token provided" });
        }const token=authheaders.split(" ")[1]
        console.log(token)
        const jwt = require('jsonwebtoken');
        const secretKey = 'pedro1234'; // Replace with your actual secret key
    
        jwt.verify(token, secretKey, (err, decoded) => {
          if (err) {
            return res.status(401).json({ authenticated: false, message: 'Invalid token' });
          }
    
          // Token is valid, proceed with the request
          console.log('Decoded token:', decoded);
          res.json({ authenticated: true, user: decoded });
        });
    } catch (error) {
        res.clearCookie("authToken"); // Clear expired/invalid token
        return res.status(401).json({ authenticated: false, message: "Invalid or expired token" });
    }
});

module.exports = router;
