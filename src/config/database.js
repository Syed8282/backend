const { Sequelize } = require('sequelize');
require('dotenv').config(); // Load environment variables from .env

const sequelize = new Sequelize(
    process.env.DB_DATABASE,    // Database name
    process.env.DB_USER,        // Database user
    process.env.DB_PASSWORD,    // Database password
    {
        host: process.env.DB_HOST,   // Database host
        port: process.env.DB_PORT,   // Database port
        dialect: 'postgres',         // Specify PostgreSQL dialect
        logging: false,              // Set to true to see SQL queries in console (useful for debugging)
        define: {
            timestamps: true,        // Adds createdAt and updatedAt fields automatically
            underscored: true,       // Use snake_case for column names (e.g., created_at instead of createdAt)
        },
        pool: { // Connection pool configuration
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('PostgreSQL connected successfully!');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        // Exit the process if database connection fails, as the app cannot function
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };
