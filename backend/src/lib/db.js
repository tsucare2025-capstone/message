import mysql from 'mysql2';

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

export default connection;