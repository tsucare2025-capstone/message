const jwt = require('jsonwebtoken');
const db = require('../lib/db');

const protectRoute = async (req, res, next) => {
    try{
        // Get token from cookies (jwt) or Authorization header
        const token = req.cookies?.jwt || req.headers.authorization?.replace('Bearer ', '');
        
        if(!token){
            return res.status(401).json({message: 'Unauthorized - No Token'});
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded){
            return res.status(401).json({message: 'Unauthorized - Invalid Token'});
        }
        
        // Use MySQL query instead of MongoDB syntax
        const query = 'SELECT * FROM counselor WHERE counselorID = ?';
        db.query(query, [decoded.userId], (err, results) => {
            if (err) {
                return res.status(500).json({message: 'Database error'});
            }
            
            if (results.length === 0) {
                return res.status(401).json({message: 'Unauthorized - User Not Found'});
            }
            
            req.user = results[0];
            next();
        });
    }catch(error){
        res.status(500).json({message: error.message});
    }
}

module.exports = { protectRoute };      