const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');
require('dotenv').config();

// Helper function to generate a JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION, // e.g., '1h', '1d' (from .env)
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // 1. Check if user already exists
        let user = await User.findOne({ where: { email } });
        if (user) {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }

        // Check if username already exists
        user = await User.findOne({ where: { username } });
        if (user) {
            return res.status(400).json({ message: 'Username is already taken.' });
        }

        // 2. Hash password
        const hashedPassword = await hashPassword(password);

        // 3. Create user in the database
        user = await User.create({
            username,
            email,
            password: hashedPassword,
        });

        // 4. If user created successfully, send response with token
        if (user) {
            res.status(201).json({
                message: 'User registered successfully!',
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                },
                token: generateToken(user.id),
            });
        } else {
            // Should theoretically not happen if validation is robust
            res.status(400).json({ message: 'Invalid user data provided.' });
        }
    } catch (error) {
        console.error('Error during user registration:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Check if user exists by email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials (email or password).' });
        }

        // 2. Compare provided password with hashed password in database
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials (email or password).' });
        }

        // 3. If credentials match, send response with user info and JWT
        res.json({
            message: 'Logged in successfully!',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            },
            token: generateToken(user.id),
        });
    } catch (error) {
        console.error('Error during user login:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};

// @desc    Get current user profile (for logged-in user)
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        // req.user contains the user ID from the JWT payload, set by authMiddleware
        const user = await User.findByPk(req.user, {
            attributes: { exclude: ['password', 'createdAt', 'updatedAt'] } // Exclude sensitive/unnecessary fields
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error fetching profile.' });
    }
};


module.exports = {
    registerUser,
    loginUser,
    getMe,
};
