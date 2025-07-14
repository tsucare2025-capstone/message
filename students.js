const express = require('express');
const db = require('./db');
const router = express.Router();

// GET /students?gender=male&college=CCS
router.get('/', (req, res) => {
    const { gender, college, search } = req.query;
    let query = 'SELECT * FROM student WHERE 1=1';
    const params = [];
    if (gender) {
        query += ' AND gender = ?';
        params.push(gender);
    }
    if (college) {
        query += ' AND college = ?';
        params.push(college);
    }
    if (search) {
        query += ' AND (name LIKE ? OR program LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }
    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

module.exports = router;