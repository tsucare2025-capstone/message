import db from '../lib/db.js';
import { socketRecieverSocketId, io } from '../lib/socket.js';

const getUsersForSideBar = async (req, res) => {
    try{
        const loggedInUser = req.user;
        // Get all counselors except the logged-in one
        const query = 'SELECT counselorID as _id, name, email FROM counselor WHERE counselorID != ?';
        db.query(query, [loggedInUser.counselorID], (err, results) => {
            if (err) {
                return res.status(500).json({message: err.message});
            }
            res.status(200).json(results);
        });
    }catch(error){
        res.status(500).json({message: error.message});
    }
}

const getMessages = async (req, res) => {
    try{
        const {userId:userToChatId} = req.params;
        const senderId = req.user.counselorID;

        // Get messages between two users, ordered by timestamp
        const query = 'SELECT * FROM messages WHERE (counselorID = ? AND studentID = ?) OR (counselorID = ? AND studentID = ?) ORDER BY timestamp';
        db.query(query, [senderId, userToChatId, userToChatId, senderId], (err, results) => {
            if (err) {
                return res.status(500).json({message: err.message});
            }
            res.status(200).json(results);
        });
    }catch(error){
        res.status(500).json({message: error.message});
    }
}

const sendMessage = async (req, res) => {
    try{
        const {text} = req.body;
        const {userId:receiverId} = req.params; // receiverId can be co-counselor or student
        const counselorId = req.user.counselorID;
        
        console.log('Send message request:', { text, receiverId, counselorId });
        
        if (!text || !receiverId || !counselorId) {
            return res.status(400).json({message: 'Missing required fields: text, receiverId, or counselorId'});
        }
       
        // Insert message without image column
        const query = 'INSERT INTO messages (counselorID, studentID, text, timestamp) VALUES (?, ?, ?, NOW())';
        db.query(query, [counselorId, receiverId, text], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({message: err.message});
            }
            
            // Return the created message without image
            const newMessage = {
                messageID: results.insertId,
                counselorID: counselorId,
                studentID: receiverId,
                text: text,
                timestamp: new Date()
            };

            const receiverSocketId = socketRecieverSocketId(receiverId);
            console.log('Receiver socket ID:', receiverSocketId);

            if(receiverSocketId){
                io.to(receiverSocketId).emit('newMessage', newMessage);
            }else{
                console.log('Receiver is not online, message saved in database');
            }
            console.log('Message sent successfully:', newMessage);
            res.status(201).json(newMessage);
        });
    }catch (error){
        console.error('Send message error:', error);
        res.status(500).json({message: error.message});
    }
}

export {getUsersForSideBar, getMessages, sendMessage};