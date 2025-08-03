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

// GET /students/:id/sessions - get all sessions for a student with schedule details
router.get('/:id/sessions', (req, res) => {
    const { id } = req.params;
    const query = `
        SELECT s.*, a.date, a.time, a.campus
        FROM session s
        JOIN appointment a ON s.appointmentID = a.appointmentID
        WHERE a.studentID = ?
        ORDER BY s.sessionDate DESC, s.sessionTime DESC
    `;
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

// GET /students/:id - get a single student by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM student WHERE studentID = ?', [id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json(results[0]);
    });
});

// GET /sessions/:id - get a single session by sessionID with appointment, feedback, and student details
router.get('/sessions/:id', (req, res) => {
    const { id } = req.params;
    const query = `
        SELECT s.sessionID, s.appointmentID, s.sessionDate, s.sessionTime, s.sessionNotes, s.feedbackID, s.status,
               a.campus, a.date as appointmentDate, a.time as appointmentTime,
               f.comments as feedbackComments,
               st.name as studentName, st.program, st.studentNo, st.gender
        FROM session s
        JOIN appointment a ON s.appointmentID = a.appointmentID
        JOIN student st ON a.studentID = st.studentID
        LEFT JOIN feedback f ON s.feedbackID = f.feedbackID
        WHERE s.sessionID = ?
    `;
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Session not found' });
        }
        res.json(results[0]);
    });
});

// PUT /sessions/:id - update session notes
router.put('/sessions/:id', (req, res) => {
    const { id } = req.params;
    const { sessionNotes } = req.body;
    
    if (!sessionNotes) {
        return res.status(400).json({ error: 'Session notes are required' });
    }
    
    const query = 'UPDATE session SET sessionNotes = ? WHERE sessionID = ?';
    db.query(query, [sessionNotes, id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Session not found' });
        }
        res.json({ message: 'Session notes updated successfully' });
    });
});

// Dashboard endpoints - add these before module.exports = router;

// GET /dashboard/counselor/:id - get counselor profile
router.get('/dashboard/counselor/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT counselorID, name, profession, counselorImage, assignedCollege FROM counselor WHERE counselorID = ?', [id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Counselor not found' });
        }
        res.json(results[0]);
    });
});

// GET /dashboard/monthly-sessions/:campus - get monthly sessions for all counselors at same assignedCollege
router.get('/dashboard/monthly-sessions/:campus', (req, res) => {
    const { campus } = req.params;
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    console.log('Current month:', currentMonth, 'Current year:', currentYear, 'AssignedCollege:', campus);
    
    const query = `
        SELECT s.sessionID, s.sessionDate, s.sessionTime, s.status,
               a.campus, a.time as appointmentTime,
               st.name as studentName, st.program, st.studentNo,
               c.name as counselorName
        FROM session s
        JOIN appointment a ON s.appointmentID = a.appointmentID
        JOIN student st ON a.studentID = st.studentID
        JOIN counselor c ON a.counselorID = c.counselorID
        WHERE c.assignedCollege = ? 
        AND MONTH(s.sessionDate) = ? 
        AND YEAR(s.sessionDate) = ?
        AND s.sessionDate >= CURDATE()
        ORDER BY s.sessionDate ASC, s.sessionTime ASC
        LIMIT 10
    `;
    
    db.query(query, [campus, currentMonth, currentYear], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        console.log('Query results:', results);
        res.json(results);
    });
});

// GET /dashboard/stats/:campus - get dashboard statistics for all counselors at same assignedCollege
router.get('/dashboard/stats/:campus', (req, res) => {
    const { campus } = req.params;
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    const query = `
        SELECT 
            COUNT(DISTINCT CASE WHEN s.sessionID IS NOT NULL THEN a.studentID END) as totalPatients,
            COUNT(s.sessionID) as totalSessions,
            SUM(CASE WHEN s.status = 'Resolved' THEN 1 ELSE 0 END) as resolvedSessions,
            SUM(CASE WHEN s.status = 'Cancelled' THEN 1 ELSE 0 END) as cancelledSessions
        FROM appointment a
        LEFT JOIN session s ON a.appointmentID = s.appointmentID
        JOIN counselor c ON a.counselorID = c.counselorID
        WHERE c.assignedCollege = ? 
        AND MONTH(a.date) = ? 
        AND YEAR(a.date) = ?
    `;
    
    db.query(query, [campus, currentMonth, currentYear], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results[0]);
    });
});

// Test endpoint to see all sessions
router.get('/test/sessions', (req, res) => {
    const query = `
        SELECT s.sessionID, s.sessionDate, s.sessionTime, s.status,
               a.campus, a.date as appointmentDate,
               st.name as studentName, st.program, st.studentNo,
               c.name as counselorName
        FROM session s
        JOIN appointment a ON s.appointmentID = a.appointmentID
        JOIN student st ON a.studentID = st.studentID
        JOIN counselor c ON a.counselorID = c.counselorID
        ORDER BY s.sessionDate ASC
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        console.log('All sessions:', results);
        res.json(results);
    });
});

// Test endpoint to see just sessions table
router.get('/test/sessions-only', (req, res) => {
    const query = 'SELECT * FROM session ORDER BY sessionDate ASC';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        console.log('Sessions table:', results);
        res.json(results);
    });
});

module.exports = router;