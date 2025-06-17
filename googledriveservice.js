const { google } = require("googleapis");
const fs = require("fs");
const path = require('path');

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "./google-service-account.json"),
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({ version: "v3", auth });

const uploadFileToDrive = async (filePath, filename, mimeType) => {
  const fileMetadata = {
    name: filename,
    parents: ['14KS2uo3V7kKqKx0xMY05xzUIOFJGHHLu'], 
  };
  const media = {
    mimeType,
    body: fs.createReadStream(filePath),
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: "id, webViewLink, webContentLink",
  });

  return response.data;
};

const downloadFileFromDrive = async (fileId, res) => {
  try {
    const driveRes = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "stream" }
    );

    // Optionally get the MIME type from Drive
    const meta = await drive.files.get({ fileId, fields: "name, mimeType" });

    res.setHeader("Content-Type", meta.data.mimeType || "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${meta.data.name}"`);

    driveRes.data
      .on("end", () => console.log("Download complete"))
      .on("error", (err) => console.error("Stream error", err))
      .pipe(res);
  } catch (err) {
    console.error("Download failed:", err.message);
    res.status(500).send("Failed to download file");
  }
};


module.exports = {
  uploadFileToDrive,
  downloadFileFromDrive,
};
