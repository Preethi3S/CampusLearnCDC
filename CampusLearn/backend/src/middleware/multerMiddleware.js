const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ensure 'uploads' directory exists for temporary storage
const uploadDir = path.join(__dirname, "..", "..", "uploads");
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true });
}

// store files temporarily on disk; controllers upload to cloudinary from the temp path
const upload = multer({ dest: uploadDir });

module.exports = upload;
