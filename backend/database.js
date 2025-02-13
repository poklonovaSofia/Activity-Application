const { DataSource } = require('typeorm'); // Use DataSource from TypeORM 0.3.x
const { User } = require('./models/User.js'); // Import User model

// Initialize DataSource
const AppDataSource = new DataSource({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'Root123Password',
    database: 'monitor-osobnej-kond',
    synchronize: true, // Synchronize database schema
    entities: [User],  // Include your User entity
    logging: true,
});

module.exports = { AppDataSource }; // Export the necessary functions
