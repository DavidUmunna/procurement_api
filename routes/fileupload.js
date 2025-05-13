const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const file_=require("../models/file")

const router = express.Router();




//console.log("path variable",path)
const uploadDir = path.join("../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {

        
        cb(null, "../uploads/");
      
      // Save files in "uploads" folder
    },
    filename: (req, file, cb) => {
      console.log('File received:', file); // Debugging line
      if (!file || !file.originalname) {
          return cb(new Error('Invalid file: originalname is missing'));
      }
        const uniqueName = `${file.originalname}`;

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


    router.post("/", upload.array("files", 5), saveFileInfo, async (req, res) => {
      try {
        const {email}=req.body
        console.log(email)
        if (!req.files || req.files.length === 0) {
          return res.status(400).json({ error: "No files uploaded" });
        }
    
        // Create file info array once
        const files = req.files.map((file) => ({
          email,
          filename: file.filename,
          url: `/uploads/${file.filename}`,
        }));
        //const {filename,url}=files
        console.log(files)
        // Assuming file_ is a model for multiple files
        const newFile = new file_({ files });
         // Pass as an object, not array
        await newFile.save();
    
        res.json({ message: "Files uploaded successfully", files });
      } catch (error) {
        console.error("Error uploading files:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
    

    

    router.get("/:email", async (req, res) => {
      try {
        const { email } = req.params;
        console.log("Requested email:", email);
    
        // Find the document that contains the file
        const fileDoc = await file_.findOne({ "files.email": email });
        if (!fileDoc) return res.status(404).json({ error: "File not found in DB" });
        console.log("filedoc", fileDoc);
    
        // Extract the specific file object from the files array
        const userFiles = fileDoc.files.filter(file => file.email === email);
        if (!userFiles || userFiles.length === 0) return res.status(404).json({ error: "File not found in document" });
    
        console.log("Extracted File Object:", userFiles);
    
        // Construct the correct file path using storedName
        userFiles.forEach(file => {
          const filePath = path.join(uploadDir, file.filename);
          console.log("File Path:", filePath);
    
          // Check if the file exists before sending
          if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', 'application/octet-stream'); // For binary
            res.setHeader('Content-Disposition', `attachment; filename=${file.filename}`);
    
            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);
          } else {
            res.status(404).json({ error: "File missing from server" });
          }
        });
      } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Server error" });
      }
    });
    router.get("/download/:filename",async(req,res)=>{
      try{
        const filename = req.params.filename;
        const filePath =path.join(uploadDir, filename);
        res.download(filePath, (err) => {
            if (err) {
                res.status(500).json({ message: "File not found or error downloading" });
            }
        });
      }catch(err){
            console.error("an error occured",err)
            res.status(500)
      }
    })

    
  module.exports = router;