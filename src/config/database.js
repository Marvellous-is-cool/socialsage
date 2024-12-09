// database.js
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'socialsage',
    waitForConnections: true,
    connectionLimit: 10, // Adjust as needed
    queueLimit: 0
};

// Function to connect to the database (using a pool instead of a single connection)
const connectDB = async () => {
    try {
        const pool = await mysql.createPool(dbConfig); // Use connection pool
        console.log('Database connected!');
        return pool; // Return the pool object
    } catch (err) {
        console.error('Database connection failed:', err);
        throw err;
    }
};

module.exports = { connectDB };
