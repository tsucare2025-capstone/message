import mysql from 'mysql2';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Debug: Log the database configuration
console.log('=== Database Configuration Debug ===');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_DATABASE:', process.env.DB_DATABASE);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***SET***' : 'NOT SET');
console.log('=== End Database Debug ===');

const connection = mysql.createConnection({
    host: 'switchback.proxy.rlwy.net',
    port: 30275,
    user: 'root',
    password: 'NcrzwnjkCMusScrwewAgvYMPptRmBphV',
    database: 'counseling_platform',
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to the database');
});

export default connection;