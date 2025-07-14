require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'counseling_platform',
    port: process.env.DB_PORT || 3306,
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to the database');
});




// Graceful shutdown
process.on('SIGINT', () => {
    connection.end((err) => {
        if (err) {
            console.error('Error closing database connection:', err);
        } else {
            console.log('Database connection closed.');
        }
        process.exit(0);
    });
});

module.exports = connection;
   
