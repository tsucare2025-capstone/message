import express from 'express';
import { validateRegistration, register, login, logout, checkAuth } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

//const bcrypt = require('bcrypt');
//const db = require('./db');
//const nodemailer = require('nodemailer');

const router = express.Router();




//user registration 
router.post('/register', validateRegistration, register);
router.post('/login', login);
router.post('/logout', logout);
router.get("/check-auth", protectRoute, checkAuth);


export default router;


