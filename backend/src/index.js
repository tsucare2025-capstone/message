import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import { app, server, io } from './lib/socket.js';
import db from './lib/db.js';
import cors from 'cors';

//const studentRoutes = require('../../students');



dotenv.config();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


// CORS
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

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

export default app;
