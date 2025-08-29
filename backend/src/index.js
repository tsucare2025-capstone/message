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

// API health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        message: 'TSUCare Backend API is running successfully!',
        status: 'online',
        database: 'connected',
        timestamp: new Date().toISOString(),
        endpoints: {
            auth: '/api/auth',
            messages: '/api/messages'
        }
    });
});

// Root route will serve the frontend (handled by the catch-all route below)

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

// Serve frontend in production
if(process.env.NODE_ENV === 'production'){
    console.log('Running in production mode - serving frontend');
    
    // Try multiple possible paths for frontend dist folder
    const possiblePaths = [
        path.join(__dirname, "..", "..", "frontend", "dist"),
        path.join(__dirname, "..", "frontend", "dist"),
        path.join(process.cwd(), "frontend", "dist"),
        path.join(process.cwd(), "..", "frontend", "dist")
    ];
    
    let frontendPath = null;
    for (const testPath of possiblePaths) {
        try {
            const indexPath = path.join(testPath, "index.html");
            if (require('fs').existsSync(indexPath)) {
                frontendPath = testPath;
                console.log('Found frontend at:', frontendPath);
                break;
            }
        } catch (e) {
            console.log('Path not accessible:', testPath);
        }
    }
    
    if (frontendPath) {
        console.log('Serving frontend from:', frontendPath);
        app.use(express.static(frontendPath));
        
        // Serve frontend for all non-API routes (this must come BEFORE the 404 handler)
        app.get('*', (req, res) => {
            const indexPath = path.join(frontendPath, "index.html");
            console.log('Serving index.html from:', indexPath);
            res.sendFile(indexPath);
        });
    } else {
        console.error('Frontend dist folder not found! Tried paths:', possiblePaths);
        // Fallback: serve a simple message
        app.get('*', (req, res) => {
            res.send(`
                <html>
                    <body>
                        <h1>TSUCare Backend Running</h1>
                        <p>Frontend not found. Check Railway build logs.</p>
                        <p>Current directory: ${process.cwd()}</p>
                        <p>Backend directory: ${__dirname}</p>
                    </body>
                </html>
            `);
        });
    }
}

// 404 handler for unmatched routes (only for API routes that don't exist)
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Route not found',
        message: `The route ${req.originalUrl} does not exist`
    });
});

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
