const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/auth');
const withdrawalController = require('../../controllers/withdrawalController');

// Apply the authentication middleware to protect the route
router.get('/', authMiddleware, withdrawalController.getWithdrawalPage); // Ensure the user is authenticated

module.exports = router;
