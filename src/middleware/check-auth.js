const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.use((req, res, next) => {
  try {
    const authheaders = req.headers.authorization;

    if (!authheaders || !authheaders.startsWith("Bearer ")) {
      return res.status(401).json({
        authenticated: false,
        message: "No token provided",
      });
    }

    const token = authheaders.split(" ")[1];
    console.log("Token:", token);

    const secretKey = "pedro1234"; // Replace with your actual secret key

    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          authenticated: false,
          message: "Invalid token",
        });
      }

      // Attach the decoded user information to the request object
      console.log(req.user)
      req.user = decoded;
      

      // Token is valid, proceed to the next middleware or route handler
      next();
    });
  } catch (error) {
    console.error("Error in authentication middleware:", error);
    res.clearCookie("authToken"); // Clear expired/invalid token
    return res.status(401).json({
      authenticated: false,
      message: "Invalid or expired token",
    });
  }
});

module.exports = router;