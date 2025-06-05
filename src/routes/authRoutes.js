const express = require('express');
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validateRegister, validateLogin } = require('../middleware/validationMiddleware');

const router = express.Router();

// Public routes for user authentication
router.post('/register', validateRegister, registerUser); // Validate input before registration
router.post('/login', validateLogin, loginUser);       // Validate input before login

// Private route to get authenticated user's profile
router.get('/me', protect, getMe); // 'protect' middleware ensures only authenticated users can access

module.exports = router;
