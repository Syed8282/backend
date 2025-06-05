const express = require('express');
const cors = require('cors');        // For Cross-Origin Resource Sharing
const helmet = require('helmet');    // For security headers
const { connectDB } = require('./config/database');
const { syncModels } = require('./models/index');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
require('dotenv').config();          // Load environment variables

const app = express();

// Connect to Database
connectDB();

// Synchronize Database Models (creates/updates tables)
// This will run when the server starts. In production, consider using migrations.
syncModels();

// --- Express Middleware ---

// Body parser for JSON requests (for req.body)
app.use(express.json());
// Body parser for URL-encoded requests (for form data)
app.use(express.urlencoded({ extended: false }));

// CORS Middleware: Allows cross-origin requests from specified frontend origins.
// This is crucial for your frontend to communicate with your backend.
const corsOptions = {
    origin: (origin, callback) => {
        // Get allowed origins from environment variables (comma-separated)
        const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()) : [];
        // Allow requests with no origin (like mobile apps or curl requests)
        // or if the origin is in the allowed list.
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`CORS: Origin ${origin} not allowed.`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed HTTP methods
    credentials: true, // Allow sending cookies/auth headers
    optionsSuccessStatus: 204, // For preflight requests
};
app.use(cors(corsOptions));

// Helmet Middleware: Helps secure your Express apps by setting various HTTP headers.
// This is a crucial "anti-hack" mechanism at the HTTP header level.
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"], // Allow Chart.js CDN
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"], // Allow Google Fonts
        fontSrc: ["'self'", "https://fonts.gstatic.com"], // Allow Google Fonts
        imgSrc: ["'self'", "data:", "https://via.placeholder.com"], // Allow placeholder images
        connectSrc: ["'self'", "http://localhost:5000", "http://127.0.0.1:5000"], // Allow frontend to connect to backend
    },
}));


// --- API Routes ---
app.use('/api/auth', authRoutes);       // Authentication routes (register, login, get me)
app.use('/api/projects', projectRoutes); // Project CRUD routes

// Basic root route for API status check
app.get('/', (req, res) => {
    res.send('Syed Muzammil\'s Portfolio Backend API is Running!');
});

// --- Error Handling Middleware ---
// This should be the last middleware added.
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack for debugging
    res.status(err.statusCode || 500).json({ // Use custom status code if available, else 500
        message: err.message || 'Something went wrong!',
        // In production, avoid sending detailed error stack to client
        // error: process.env.NODE_ENV === 'production' ? {} : err.stack
    });
});


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Syed Muzammil's Portfolio Backend Server running on port ${PORT}`);
    console.log(`CORS allowed origins: ${process.env.CORS_ORIGIN || 'Not set'}`);
});
