const express = require('express');
const router = express.Router();
const taskController = require('../../controllers/taskController');
// const { isAuthenticated } = require('../../middlewares/auth');
const upload = require('../../helpers/taskImageUpload'); // Import multer middleware

// Route to fetch a task by ID
router.get('/:id', taskController.getTaskById);

// Route to submit a task (protected route, requires authentication and file uploads)
router.post('/submit-task', upload, taskController.submitTask);

module.exports = router;
