const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth.route');
const messageRoutes = require('./routes/message.route');
const db = require('./lib/db');
//const cors = require('cors');
//const studentRoutes = require('../../students');



dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/message', messageRoutes);
//app.use('/students', studentRoutes);


// 404 handler
/*app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});*/  

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

});

module.exports = app;
