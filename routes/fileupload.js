const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const file=require("../models/file")

const router = express.Router();



//console.log("path variable",path)
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "../uploads/"); // Save files in "uploads" folder
    },
    filename: (req, file, cb) => {
      console.log('File received:', file); // Debugging line
      if (!file || !file.originalname) {
          return cb(new Error('Invalid file: originalname is missing'));
      }
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}${path.extname(file.originalname)}`;

        cb(null, uniqueName); // Unique filename
    },
  });

  const upload = multer({ storage:storage });
  const saveFileInfo = async (req, res, next) => {
    if (!req.file) return next();

    const newFile = new File({
        
        filename: req.file.filename,
        url: req.file.path, // Store the file path
    });}


  router.post("/", upload.array("files", 5),saveFileInfo, (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }
    
  
    const fileUrls = req.files.map((file) => ({
      filename: file.filename,
      url: `/uploads/${file.filename}`,
    }));
  
    res.json({ message: "Files uploaded successfully", files: fileUrls });
  });


  router.get("/download/:filename", async (req, res) => {
    try {
        const file = await File.findOne({ storedName: req.params.filename });

        if (!file) return res.status(404).json({ error: "File not found" });

        const filePath = path.join(__dirname, "uploads", file.storedName);
        
        // Check if file exists before sending
        if (!fs.existsSync(filePath)) return res.status(404).json({ error: "File missing from server" });

        res.download(filePath, file.originalName);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});
  module.exports = router;