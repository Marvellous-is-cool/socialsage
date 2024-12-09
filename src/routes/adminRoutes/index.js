const express = require('express');
const router = express.Router();

// Route to render the index.ejs page
router.get('/', (req, res) => {
    res.render('index');  // This will render views/index.ejs
});

module.exports = router;