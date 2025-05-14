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
  const driveRes = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "stream" }
  );

  driveRes.data
    .on("end", () => console.log("Download complete"))
    .on("error", (err) => console.error("Download error", err))
    .pipe(res);
};

module.exports = {
  uploadFileToDrive,
  downloadFileFromDrive,
};
