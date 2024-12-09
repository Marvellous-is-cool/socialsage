const express = require('express');
const subscriptionController = require('../../controllers/subscriptionController');
const router = express.Router();

router.get('/', subscriptionController.getSubscriptionPage);
router.post('/process-payment', subscriptionController.processPayment);

module.exports = router;
