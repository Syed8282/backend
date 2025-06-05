const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./user'); // Import User model for defining association

const Project = sequelize.define('Project', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Project name cannot be empty.' },
            len: { args: [3, 255], msg: 'Project name must be between 3 and 255 characters.' }
        }
    },
    link: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isUrl: { msg: 'Project link must be a valid URL.' },
            notEmpty: { msg: 'Project link cannot be empty.' }
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true, // Description can be optional
        validate: {
            len: { args: [0, 2000], msg: 'Description cannot exceed 2000 characters.' }
        }
    },
    apkLink: { // Field for APK specific link, as requested by Syed Muzammil
        type: DataTypes.STRING,
        allowNull: true, // APK link can be optional
        validate: {
            isUrl: { msg: 'APK link must be a valid URL.' }
        }
    },
    // Optional fields for future expansion:
    // category: {
    //     type: DataTypes.STRING,
    //     allowNull: true,
    // },
    // technologies_used: {
    //     type: DataTypes.ARRAY(DataTypes.STRING), // Example for an array of strings
    //     allowNull: true,
    // },
}, {
    tableName: 'projects', // Explicitly set table name to 'projects'
});

// Define the association: A User has many Projects, and a Project belongs to a User.
User.hasMany(Project, {
    foreignKey: 'userId', // This will add a 'userId' column to the 'projects' table
    as: 'projects',       // Alias for the association (e.g., user.getProjects())
    onDelete: 'CASCADE',  // If a user is deleted, all their associated projects are also deleted
});
Project.belongsTo(User, {
    foreignKey: 'userId', // This links back to the User model via 'userId'
    as: 'user',           // Alias for the association (e.g., project.getUser())
});

module.exports = Project;
