const db = require('../lib/db');

const getUsersForSideBar = async (req, res) => {
    try{
        const loggedInUser = req.user;
        // Get all counselors except the logged-in one
        const query = 'SELECT counselorID, name, email FROM counselor WHERE counselorID != ?';
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
        const {text, image} = req.body;
        const {userId:studentId} = req.params;
        const counselorId = req.user.counselorID;
       
        // Insert message with all available attributes
        const query = 'INSERT INTO messages (counselorID, studentID, text, image, timestamp) VALUES (?, ?, ?, ?, NOW())';
        db.query(query, [counselorId, studentId, text, image || null], (err, results) => {
            if (err) {
                return res.status(500).json({message: err.message});
            }
            
            // Return the created message with all attributes
            const newMessage = {
                messageID: results.insertId,
                counselorID: counselorId,
                studentID: studentId,
                text: text,
                image: image || null,
                timestamp: new Date()
            };
            
            res.status(201).json(newMessage);
        });
    }catch (error){
        res.status(500).json({message: error.message});
    }
}

module.exports = {getUsersForSideBar, getMessages, sendMessage};