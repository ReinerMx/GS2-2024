const multer = require('multer');
const path = require('path');

// Configure multer storage options
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Set the upload destination
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Use timestamp + original extension
    }
});

// Initialize multer with storage options
const upload = multer({ storage });

module.exports = upload;
