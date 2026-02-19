require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Database Connection (Aiven Credentials)
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 27004,
    ssl: { rejectUnauthorized: false }, // Changed to false to fix connection issues
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Prevent App Crash on DB Connection Errors
db.on('error', (err) => {
    console.error('Database Pool Error:', err);
});

// Initialize Database Tables
const initDB = () => {
    const userTable = `
        CREATE TABLE IF NOT EXISTS mybank (
            uid INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            balance DECIMAL(15, 2),
            phone VARCHAR(20),
            role VARCHAR(50) DEFAULT 'Customer'
        )
    `;

    const tokenTable = `
        CREATE TABLE IF NOT EXISTS usertoken (
            tid INT AUTO_INCREMENT PRIMARY KEY,
            token TEXT NOT NULL,
            uid INT,
            expiry DATETIME,
            FOREIGN KEY (uid) REFERENCES mybank(uid) ON DELETE CASCADE
        )
    `;

    db.query(userTable, (err) => {
        if (err) console.error("Error creating mybank table:", err);
        else console.log("Table 'mybank' ready.");
    });

    db.query(tokenTable, (err) => {
        if (err) console.error("Error creating usertoken table:", err);
        else console.log("Table 'usertoken' ready.");
    });
};

initDB();

// --- Routes ---

// 1. Get Next UID (For Registration Display)
app.get('/api/next-uid', (req, res) => {
    db.query('SELECT MAX(uid) as maxId FROM mybank', (err, results) => {
        if (err) return res.status(500).json({ error: 'DB Error' });
        const nextId = (results[0].maxId || 0) + 1;
        res.json({ nextUid: nextId });
    });
});

// 2. Register
app.post('/api/register', async (req, res) => {
    const { username, email, password, phone } = req.body;

    // Validation
    if (password.length < 10) {
        return res.status(400).json({ error: 'Password must be at least 10 characters.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        // Random balance between 100,000 and 1,000,000
        const initialBalance = Math.floor(Math.random() * 900000) + 100000;

        const sql = `INSERT INTO mybank (username, email, password, balance, phone, role) VALUES (?, ?, ?, ?, ?, 'Customer')`;
        
        db.query(sql, [username, email, hashedPassword, initialBalance, phone], (err, result) => {
            if (err) {
                console.error("Registration DB Error:", err); // Log the actual error
                if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Email already exists.' });
                return res.status(500).json({ error: 'Database error during registration.' });
            }
            res.json({ message: 'Registration successful', redirect: '/index.html' });
        });
    } catch (e) {
        res.status(500).json({ error: 'Server error' });
    }
});

// 3. Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    const sql = 'SELECT * FROM mybank WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (results.length === 0) return res.status(401).json({ error: 'Invalid email or password' });

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

        // Generate JWT
        const token = jwt.sign(
            { username: user.username, role: user.role }, 
            JWT_SECRET, 
            { expiresIn: '1h' }
        );

        // Store Token in DB
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 1);
        
        const tokenSql = 'INSERT INTO usertoken (token, uid, expiry) VALUES (?, ?, ?)';
        db.query(tokenSql, [token, user.uid, expiryDate], (tokenErr) => {
            if (tokenErr) console.error("Error storing token:", tokenErr);
            
            // Send Cookie
            res.cookie('auth_token', token, { httpOnly: true, maxAge: 3600000 }); // 1 hour
            res.json({ message: 'Login successful', redirect: '/dashboard.html' });
        });
    });
});

// 4. Check Balance (Protected)
app.get('/api/balance', (req, res) => {
    const token = req.cookies.auth_token;

    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    // Verify Token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid Token' });

        const username = decoded.username;

        // Fetch Balance using Username
        db.query('SELECT balance FROM mybank WHERE username = ?', [username], (dbErr, results) => {
            if (dbErr) return res.status(500).json({ error: 'Database error' });
            if (results.length === 0) return res.status(404).json({ error: 'User not found' });

            res.json({ balance: results[0].balance });
        });
    });
});

// Logout
app.post('/api/logout', (req, res) => {
    res.clearCookie('auth_token');
    res.json({ message: 'Logged out', redirect: '/index.html' });
});

// Export the app for Vercel
module.exports = app;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`MyBank Server running on http://localhost:${PORT}`);
    });
}
