const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/auth');
const authController = require('../../controllers/authController');

// Protect these routes with authMiddleware
router.use('/dashboard', authMiddleware, require('./dashboard'));
router.use('/task', authMiddleware, require('./task.js'));
router.use('/profile', authMiddleware, require('./profile'));
router.use('/subscription', authMiddleware, require('./subscription'));
router.use('/withdraw', authMiddleware, require('./withdrawal'));

// Route to render the index.ejs page
router.get('/', (req, res) => {
    res.render('index'); // Render views/index.ejs
});

// Login and signup views
router.get('/login', (req, res) => {
    res.render('login', {
        success_message: req.flash('success'),
        error_message: req.flash('error')
    }); // Pass flash messages to login view
});

// Signup route
router.post('/signup', authController.register);

// Login route
router.post('/login', authController.login);

// Logout route
router.get('/logout', authController.logout);

// Signup view
router.get('/signup', (req, res) => {
    res.render('signup', {
        success_message: req.flash('success'),
        error_message: req.flash('error')
    }); // Pass flash messages to signup view
});

module.exports = router;
