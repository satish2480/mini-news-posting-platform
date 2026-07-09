const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");

const uploadsDirectory = path.join(process.cwd(), "uploads");
const allowedMimeTypes = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"]
]);

if (!fs.existsSync(uploadsDirectory)) {
  fs.mkdirSync(uploadsDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadsDirectory);
  },
  filename: (_req, file, callback) => {
    const extension = allowedMimeTypes.get(file.mimetype) || ".jpg";
    callback(null, `${Date.now()}-${crypto.randomUUID()}${extension}`);
  }
});

const fileFilter = (_req, file, callback) => {
  const originalExtension = path.extname(file.originalname || "").toLowerCase();
  const expectedExtension = allowedMimeTypes.get(file.mimetype);

  if (!expectedExtension || (originalExtension && originalExtension !== expectedExtension)) {
    const error = new Error("Only image uploads are allowed");
    error.statusCode = 400;
    callback(error);
    return;
  }

  callback(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

module.exports = upload;
