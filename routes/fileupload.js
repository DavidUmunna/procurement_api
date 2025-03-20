const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();




const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "../uploads/"); // Save files in "uploads" folder
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    },
  });

  const upload = multer({ storage });


  router.post("/", upload.array("files", 5), (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }
  
    const fileUrls = req.files.map((file) => ({
      filename: file.filename,
      url: `/uploads/${file.filename}`,
    }));
    
    res.json({ message: "Files uploaded successfully", files: fileUrls });
  });


  app.get("/download/:filename", async (req, res) => {
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