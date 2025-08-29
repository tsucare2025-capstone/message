import jwt from 'jsonwebtoken';
import db from '../lib/db.js';

const protectRoute = async (req, res, next) => {
    try{
        const token = req.cookies?.jwt || req.headers.authorization?.replace('Bearer ', '');
        
        if(!token){
            return res.status(401).json({message: 'Unauthorized - No Token'});
        }
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            if(!decoded){
                return res.status(401).json({message: 'Unauthorized - Invalid Token'});
            }
            
            const query = 'SELECT * FROM counselor WHERE counselorID = ?';
            db.query(query, [decoded.userId], (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({message: 'Database error'});
                }
                
                if (results.length === 0) {
                    return res.status(401).json({message: 'Unauthorized - User Not Found'});
                }
                
                req.user = results[0];
                next();
            });
        } catch (jwtError) {
            console.error('JWT verification error:', jwtError);
            return res.status(401).json({message: 'Unauthorized - Invalid Token'});
        }
    }catch(error){
        console.error('Middleware error:', error);
        res.status(500).json({message: error.message});
    }
}

export { protectRoute };