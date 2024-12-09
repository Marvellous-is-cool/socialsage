const express = require('express');
const router = express.Router();
const { getDashboardTasks } = require('../../controllers/dashboardController');

// Dashboard route - Fetch tasks based on user's plan and task status
router.get('/', getDashboardTasks);

module.exports = router;
