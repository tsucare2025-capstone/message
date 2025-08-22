const express = require('express');
const {getUsersForSideBar, getMessages, sendMessage} = require('../controllers/message.controller');
const { protectRoute } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/users', protectRoute, getUsersForSideBar);
router.get("/:userId", protectRoute, getMessages);
router.post("/send/:userId", protectRoute, sendMessage);

module.exports = router;