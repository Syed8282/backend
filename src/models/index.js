const { sequelize } = require('../config/database');
const User = require('./user');
const Project = require('./project');

// You can add more models here as your application grows.
// Ensure all models are imported before `sequelize.sync()` if they have associations,
// so Sequelize can properly set up foreign keys.

const syncModels = async () => {
    try {
        // `alter: true` attempts to change existing tables to match the model.
        // It's good for development, but for production,
        // it's recommended to use Sequelize Migrations (`sequelize-cli`) for controlled schema changes.
        await sequelize.sync({ alter: true });
        console.log('All models were synchronized successfully (tables created/updated).');
    } catch (error) {
        console.error('Error synchronizing models:', error);
        // Do not exit process here, let the server start, but log the error.
        // The issue is with table creation, not database connection.
    }
};

module.exports = {
    sequelize,
    User,
    Project,
    syncModels,
};
