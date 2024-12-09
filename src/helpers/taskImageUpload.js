const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create storage engine for multer
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const taskName = req.body.submitted_task_id; // Assume task ID is passed in the body
    const username = req.user.username; // Use the username from req.user

    // Path where the files will be stored
    const dir = path.join(__dirname, `../public/uploads/${taskName}/${username}`);
    
    try {
      // Create the directory if it doesn't exist
      await fs.promises.mkdir(dir, { recursive: true });
      cb(null, dir); // Save the file to this directory
    } catch (error) {
      console.error("Error creating directory:", error);
      cb(new Error('Failed to create directory'), false);
    }
  },
  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname); // Get file extension
    const fileName = Date.now() + fileExtension; // Use timestamp to prevent filename conflicts
    cb(null, fileName); // Save the file with a unique timestamp-based name
  }
});

// Initialize multer with the storage configuration
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
}).fields([
  { name: 'media_upload_1', maxCount: 1 },
  { name: 'media_upload_2', maxCount: 1 },
  { name: 'media_upload_3', maxCount: 1 }
]); // Define three file fields for uploads

module.exports = upload;
