const db = require('../lib/db');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const {generateToken} = require('../lib/utils');

//input validation for registration
const validateRegistration = (req, res, next) => {
    const { name, email, password } = req.body;

    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    next();
};

//user registration 
const register = async (req, res) => {
    const { name, email, password } = req.body;

    try{
        // Check if user already exists
        const checkQuery = 'SELECT * FROM counselor WHERE email = ?';
        db.query(checkQuery, [email], async (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (results.length > 0) {
                res.status(409).json({ error: 'User already exists' });
                return;
            }
            
            //hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            const insertQuery = 'INSERT INTO counselor (name, email, password) VALUES (?, ?, ?)';
            db.query(insertQuery, [name, email, hashedPassword], async (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Error registering user' });
                }
                
                // Generate token
                const token = generateToken(results.insertId);
               // await db.query('UPDATE counselor SET is_verified = 1 WHERE counselorID = ?', [results.insertId]);

                // Set the cookie
                res.cookie('jwt', token, {
                    httpOnly: true,
                    secure: false,
                    maxAge: 24 * 60 * 60 * 1000 // 24 hours
                });
                
                res.status(201).json({ 
                    message: 'User registered successfully',
                    userId: results.insertId,
                    token
                });
            });
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Error registering user' });
    }
};

//user login
const login = (req, res) => {
    const { email, password } = req.body;

    //check if the user exists by email
    const query = 'SELECT * FROM counselor WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length > 0) {
            const user = results[0];

            try {
                // Compare the hashed password
                const isMatch = await bcrypt.compare(password, user.password);

                if (isMatch) {
                    res.status(200).json({ 
                        message: 'Login successful',
                        user: {
                            counselorID: user.counselorID,
                            name: user.name,
                            email: user.email,
                            assignedCollege: user.assignedCollege,
                            is_verified: user.is_verified
                        }
                    });
                } else {
                    res.status(401).json({ error: 'Invalid credentials' });
                }
            } catch (error) {
                console.error('Password comparison error:', error);
                res.status(500).json({ error: 'Login error' });
            }
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    });
};

// Helper: Generate 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper: Send OTP email
async function sendOTP(emailId, otp) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_ID,
            pass: process.env.MAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    let info = await transporter.sendMail({
        from: `"2FA Service" <${process.env.MAIL_ID}>`,
        to: emailId,
        subject: "Your OTP Code",
        text: `Your OTP is: ${otp}`,
    });
    console.log("Message sent: %s", info.messageId);
}

// Request OTP handler
const requestOTP = (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });
    const query = 'SELECT * FROM counselor WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (results.length === 0) return res.status(404).json({ error: 'User not found' });
        const user = results[0];
        if (user.is_verified) return res.status(400).json({ error: 'User already verified' });
        const otp = generateOTP();
        const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry
        const updateQuery = 'UPDATE counselor SET otp = ?, otp_expiry = ? WHERE email = ?';
        db.query(updateQuery, [otp, expiry, email], async (err) => {
            if (err) return res.status(500).json({ error: 'Failed to store OTP' });
            try {
                await sendOTP(email, otp);
                res.json({ message: 'OTP sent to email' });
            } catch (e) {
                res.status(500).json({ error: 'Failed to send OTP email' });
            }
        });
    });
};

// Verify OTP handler
const verifyOTP = (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP required' });
    const query = 'SELECT * FROM counselor WHERE email = ?';
    db.query(query, [email], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (results.length === 0) return res.status(404).json({ error: 'User not found' });
        const user = results[0];
        if (user.is_verified) return res.status(400).json({ error: 'User already verified' });
        if (!user.otp || !user.otp_expiry) return res.status(400).json({ error: 'No OTP requested' });
        if (user.otp !== otp) return res.status(401).json({ error: 'Invalid OTP' });
        if (new Date() > new Date(user.otp_expiry)) return res.status(401).json({ error: 'OTP expired' });
        // Mark user as verified, clear OTP
        const updateQuery = 'UPDATE counselor SET is_verified = 1, otp = NULL, otp_expiry = NULL WHERE email = ?';
        db.query(updateQuery, [email], (err) => {
            if (err) return res.status(500).json({ error: 'Failed to verify user' });
            res.json({ message: 'User verified successfully' });
        });
    });
};

const checkAuth = (req, res) => {
    try{
        res.status(200).json({user: req.user});
    }catch(error){
        res.status(500).json({message: error.message});
    }
}

const logout = (req, res) => {
    try{
        res.clearCookie('jwt', "", {maxAge: 0});
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Logout error' });
    }
};

/*const generateToken = (userId) => {
    // Simple token generation - you might want to use JWT instead
    return Buffer.from(`${userId}-${Date.now()}`).toString('base64');
};*/

module.exports = {
    validateRegistration,
    register,
    login,
    logout,
    requestOTP,
    verifyOTP,
    checkAuth
};


