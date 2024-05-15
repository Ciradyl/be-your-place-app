const multer = require("multer");
const { v1: uuidv1 } = require("uuid");

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
};

const fileUpload = multer({
  limits: 500000, // 500KB file size limit
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, "uploads/images"); // Uploads folder
    },
    filename: (req, file, callback) => {
      const fileExtention = MIME_TYPE_MAP[file.mimetype];
      callback(null, uuidv1() + "." + fileExtention); // Unique filename with extension
    },
  }),
  fileFilter: (req, file, callback) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    let error = isValid ? null : new Error("Invalid mime type!"); // Only allow specified MIME types
    callback(error, isValid);
  },
});

module.exports = fileUpload;
