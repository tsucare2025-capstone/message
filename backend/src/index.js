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

// Debug: Log environment and package info
console.log('=== Environment Debug ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Current working directory:', process.cwd());
console.log('=== End Debug ===');

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
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://your-frontend-domain.com', 'http://localhost:3000'] 
        : 'http://localhost:5173',
    credentials: true,
}));

// Route validation middleware to prevent path-to-regexp crashes
app.use((req, res, next) => {
    const url = req.url;
    
    // Only check for the most dangerous patterns that could cause crashes
    if (url.includes('//') || url.includes('..')) {
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

// Frontend is served separately in production
if(process.env.NODE_ENV === 'production'){
    console.log('Running in production mode - frontend should be served separately');
}

// Start server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Global error handlers to prevent crashes
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    if (err.message && err.message.includes('path-to-regexp')) {
        console.error('Path-to-regexp error caught at process level');
    }
    // Don't exit the process, just log the error
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    if (reason && reason.message && reason.message.includes('path-to-regexp')) {
        console.error('Path-to-regexp rejection caught at process level');
    }
});

export default app;
