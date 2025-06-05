const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,           // Universally Unique Identifier
        defaultValue: DataTypes.UUIDV4, // Auto-generate UUID (v4)
        primaryKey: true,
        allowNull: false,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,                   // Ensures usernames are unique
        validate: {
            notEmpty: { msg: 'Username cannot be empty.' },
            len: { args: [3, 50], msg: 'Username must be between 3 and 50 characters.' }
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,                   // Ensures emails are unique
        validate: {
            isEmail: { msg: 'Must be a valid email address.' },
            notEmpty: { msg: 'Email cannot be empty.' }
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Password cannot be empty.' }
            // Password length validation is handled by express-validator before hashing
        }
    },
}, {
    tableName: 'users', // Explicitly set table name to 'users'
    // Sequelize automatically adds createdAt and updatedAt columns due to 'timestamps: true' in config
});

module.exports = User;
