const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const admin = require('./src/routes/adminRoutes');
const client = require('./src/routes/clientRoutes');
const path = require('path');
const {connectDB} = require('./src/config/database');
const session = require('express-session');
const flash = require('connect-flash');

dotenv.config();

const app = express();

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: true,
  })
);

// Flash message middleware after session
app.use(flash());

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Database management
connectDB();

// Route handlers
app.use('/admin', admin);
app.use('/', client);

// Static files
app.use(express.static(path.join(__dirname, 'src/public')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Flash message middleware to make it available in views
app.use((req, res, next) => {
  res.locals.success_message = req.flash('success');
  res.locals.error_message = req.flash('error');
  next();
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).render("addons/error404");
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
