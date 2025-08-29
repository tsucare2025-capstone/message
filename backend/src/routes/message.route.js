import express from 'express';
import {getUsersForSideBar, getMessages, sendMessage} from '../controllers/message.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

// Validate userId parameter middleware
const validateUserId = (req, res, next) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId) || userId <= 0) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }
    req.params.userId = userId;
    next();
};

router.get('/users', protectRoute, getUsersForSideBar);
router.get('/messages/:userId([0-9]+)', protectRoute, validateUserId, getMessages);
router.post('/send/:userId([0-9]+)', protectRoute, validateUserId, sendMessage);

export default router;