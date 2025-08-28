const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

const path = require('path');

const authRoutes = require('./routes/auth.route');
const messageRoutes = require('./routes/message.route');
const { app, server, io } = require('./lib/socket');
const db = require('./lib/db');
const cors = require('cors')({
    origin: 'http://localhost:5173',
    credentials: true,
});

//const studentRoutes = require('../../students');



dotenv.config();
const PORT = process.env.PORT || 3000;

const __dirname = path.resolve();

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173'); // Specific origin instead of *
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Credentials', 'true'); // Important for cookies
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
//app.use('/students', studentRoutes);

if(process.env.NODE_ENV === 'production'){
    app.use(express.static(path.join(__dirname, "..", "frontend", "dist")));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, "..", "frontend", "dist", "index.html"));
    });
}

// 404 handler
/*app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});*/  

// Start server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

});

module.exports = app;
