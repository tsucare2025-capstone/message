const { Server } = require('socket.io');
const http = require('http');
const express = require('express');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        credentials: true,
    },
});

const  socketRecieverSocketId = (userId) => {
    return userSocketMap[userId];
}
const userSocketMap = {};

io.on('connection', (socket) => {
    console.log('a user connected', socket.id);
    console.log('Query params:', socket.handshake.query); // Debug log

    const userId = socket.handshake.query.userId;
    console.log('User ID from query:', userId); // Debug log
    
    // Only add to map if userId is valid
    if (userId && userId !== 'undefined') {
        userSocketMap[userId] = socket.id;
        console.log('Updated userSocketMap:', userSocketMap); // Debug log
    } else {
        console.log('Invalid userId, not adding to map:', userId);
    }

    //io.emit is used to send a message to all connected clients
    const onlineUserIds = Object.keys(userSocketMap).filter(id => id !== 'undefined');
    console.log('About to emit getOnlineUsers with:', onlineUserIds); // DEBUG: Add this
    io.emit('getOnlineUsers', onlineUserIds);
    console.log('Emitted online users:', onlineUserIds); // Debug log

    socket.on('disconnect', () => {
        console.log('a user disconnected', socket.id);
        delete userSocketMap[userId];
        const remainingUsers = Object.keys(userSocketMap);
        console.log('Remaining users after disconnect:', remainingUsers); // DEBUG: Add this
        io.emit('getOnlineUsers', remainingUsers);
    });
});

module.exports = { io, app, server, socketRecieverSocketId };