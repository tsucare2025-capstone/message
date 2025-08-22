const express = require('express');
const { validateRegistration, register, login, logout, checkAuth } = require('../controllers/auth.controller');
const { protectRoute } = require('../middleware/auth.middleware');

//const bcrypt = require('bcrypt');
//const db = require('./db');
//const nodemailer = require('nodemailer');

const router = express.Router();




//user registration 
router.post('/register', validateRegistration, register);
router.post('/login', login);
router.post('/logout', logout);
router.get("/check-auth", protectRoute, checkAuth);


module.exports = router;


