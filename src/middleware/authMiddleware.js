const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load JWT_SECRET from .env

// Middleware to protect routes: verifies JWT and attaches user ID to request
const protect = (req, res, next) => {
    let token;

    // Check if authorization header exists and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        // Extract the token (e.g., "Bearer TOKEN_STRING" -> "TOKEN_STRING")
        token = req.headers.authorization.split(' ')[1];
    }

    // If no token is found, deny access
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided.' });
    }

    try {
        // Verify the token using the secret from environment variables
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the user's ID from the token payload to the request object.
        // This ID can then be used in subsequent controllers to fetch user-specific data.
        req.user = decoded.id;
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error('Token verification failed:', error.message);
        return res.status(401).json({ message: 'Not authorized, token failed or expired.' });
    }
};

module.exports = { protect };
