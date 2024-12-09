// middleware/auth.js

const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token || req.headers['authorization']?.split(' ')[1]; // Look for token in cookies or Authorization header
    
    if (!token) {
        return res.redirect('/login'); // Redirect to login if token is not provided
    }

    jwt.verify(token, process.env.JWT_SECRET || 'default_secret', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized, invalid token' });
        }

        req.user = decoded; // Add decoded user data to request object
        next(); // Proceed to the next middleware or route handler
    });
};

module.exports = authMiddleware;
