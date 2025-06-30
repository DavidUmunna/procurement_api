const {IncomingForm} = require("formidable");
const path = require("path");
function formidableMiddleware(req, res, next) {
  const form = formidable({ uploadDir: "tempUploads/", keepExtensions: true });

  form.parse(req, (err, fields, files) => {
    if (err) return next(err);
    req.body = fields;
    req.files = files;
    next();
  });
}
function formidableMiddlewarefiles(fieldName, maxFiles) {
  return (req, res, next) => {
    const form = new IncomingForm({
      uploadDir: path.join(__dirname, "../tempUploads"),
      keepExtensions: true,
      multiples: true,
      maxFiles
    });

    form.parse(req, (err, fields, files) => {
      if (err) return next(err);

      // Filter only the specified field
      const fieldFiles = files[fieldName];

      if (!fieldFiles) {
        return res.status(400).json({ error: `Missing field: ${fieldName}` });
      }

      // Enforce maxFiles manually if needed
      const filesArray = Array.isArray(fieldFiles) ? fieldFiles : [fieldFiles];
      if (filesArray.length > maxFiles) {
        return res.status(400).json({ error: `Too many files (max ${maxFiles})` });
      }

      req.body = fields;
      req.files = { [fieldName]: filesArray };
      console.log("this is where it is at")
      next();
    });
  };
}
module.exports={formidableMiddleware,formidableMiddlewarefiles}