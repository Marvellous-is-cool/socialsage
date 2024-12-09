const express = require('express');
const router = express.Router();
const profileController = require('../../controllers/profileController');
const upload = require('../../helpers/imageUpload');

// Profile Routes
router.get('/', profileController.getProfile);
router.post('/update', upload.none(), profileController.updateProfile);
router.post('/update-avatar', upload.single('avatar'), profileController.updateAvatar);

module.exports = router;
