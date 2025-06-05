const { check, validationResult } = require('express-validator');

// Generic function to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // If there are validation errors, return a 400 Bad Request with the error details
        return res.status(400).json({ errors: errors.array() });
    }
    next(); // If no errors, proceed
};

// Validation rules for user registration
const validateRegister = [
    check('username', 'Username is required and must be between 3 and 50 characters.').isLength({ min: 3, max: 50 }).trim().escape(),
    check('email', 'Please include a valid email address.').isEmail().normalizeEmail(),
    check('password', 'Password is required and must be at least 6 characters long.').isLength({ min: 6 }),
    handleValidationErrors // Apply error handler after checks
];

// Validation rules for user login
const validateLogin = [
    check('email', 'Please include a valid email address.').isEmail().normalizeEmail(),
    check('password', 'Password is required.').notEmpty(),
    handleValidationErrors // Apply error handler after checks
];

// Validation rules for project creation/update
const validateProject = [
    check('name', 'Project name is required.').notEmpty().trim().escape(),
    check('link', 'Project link must be a valid URL.').isURL(),
    check('description', 'Description must be a string and cannot exceed 2000 characters.').optional().isString().isLength({ max: 2000 }).trim().escape(),
    check('apkLink', 'APK link must be a valid URL.').optional().isURL(), // Optional as per requirement
    handleValidationErrors // Apply error handler after checks
];

module.exports = { validateRegister, validateLogin, validateProject };
