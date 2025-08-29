import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import { createSocketServer } from './lib/socket.js';
import db from './lib/db.js';
import cors from 'cors';
import { setSocketRefs } from './controllers/message.controller.js';

dotenv.config();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

// Route validation middleware to prevent path-to-regexp crashes
app.use((req, res, next) => {
    const url = req.url;
    
    // Check for malformed route patterns that could cause path-to-regexp errors
    if (url.includes('//') || url.includes('..') || url.includes('(') || url.includes(')')) {
        console.error('Malformed route detected:', url);
        return res.status(400).json({
            error: 'Invalid route format',
            message: 'The requested route contains invalid characters'
        });
    }
    
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

// Initialize socket server
const { io, socketRecieverSocketId } = createSocketServer(server);

// Set socket references in message controller
setSocketRefs(io, socketRecieverSocketId);

// Error handling middleware for route parsing errors
app.use((err, req, res, next) => {
    if (err.message && err.message.includes('path-to-regexp')) {
        console.error('Route parsing error:', err);
        return res.status(400).json({ 
            error: 'Invalid route format',
            message: 'The requested route contains invalid parameters'
        });
    }
    
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ 
            error: 'Invalid JSON format',
            message: 'The request body contains invalid JSON'
        });
    }
    
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: 'Something went wrong on the server'
    });
});

// 404 handler for unmatched routes
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Route not found',
        message: `The route ${req.originalUrl} does not exist`
    });
});

if(process.env.NODE_ENV === 'production'){
    app.use(express.static(path.join(__dirname, "..", "frontend", "dist")));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, "..", "frontend", "dist", "index.html"));
    });
}

// Start server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;
