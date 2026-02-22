require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
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

// Database Connection (PostgreSQL)
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

const db = new Pool({
    connectionString: connectionString,
    ...(connectionString ? {
        ssl: { rejectUnauthorized: false } // Force SSL for Vercel/Cloud
    } : {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    })
});

// Prevent App Crash on DB Connection Errors
db.on('error', (err) => {
    console.error('Database Pool Error:', err);
});

// Initialize Database Tables
const initDB = () => {
    const userTable = `
        CREATE TABLE IF NOT EXISTS mybank (
            uid SERIAL PRIMARY KEY,
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
            tid SERIAL PRIMARY KEY,
            token TEXT NOT NULL,
            uid INT,
            expiry TIMESTAMP,
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

// Check connection before initializing
db.connect((err, client, release) => {
    if (err) {
        console.error("❌ Database Connection Error:", err.message);
        if (connectionString) {
            console.error("👉 Hint: Check your Cloud/Vercel Database URL.");
        } else {
            console.error("👉 Hint: Ensure your local PostgreSQL is running and .env has DB_HOST=localhost");
        }
    } else {
        console.log(`✅ Database Connected Successfully (${connectionString ? 'Cloud' : 'Local'})`);
        release();
        initDB();
    }
});

// --- Routes ---

// 1. Get Next UID (For Registration Display)
app.get('/api/next-uid', (req, res) => {
    db.query('SELECT MAX(uid) as max_id FROM mybank', (err, results) => {
        if (err) return res.status(500).json({ error: 'DB Error' });
        const nextId = (results.rows[0].max_id || 0) + 1;
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

        const sql = `INSERT INTO mybank (username, email, password, balance, phone, role) VALUES ($1, $2, $3, $4, $5, 'Customer')`;
        
        db.query(sql, [username, email, hashedPassword, initialBalance, phone], (err, result) => {
            if (err) {
                console.error("Registration DB Error:", err); // Log the actual error
                if (err.code === '23505') return res.status(400).json({ error: 'Email already exists.' }); // 23505 is Postgres unique violation
                return res.status(500).json({ error: 'Database error during registration.' });
            }
            res.json({ message: 'Registration successful', redirect: '/login.html' });
        });
    } catch (e) {
        res.status(500).json({ error: 'Server error' });
    }
});

// 3. Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    const sql = 'SELECT * FROM mybank WHERE email = $1';
    db.query(sql, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (results.rows.length === 0) return res.status(401).json({ error: 'Invalid email or password' });

        const user = results.rows[0];
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
        
        const tokenSql = 'INSERT INTO usertoken (token, uid, expiry) VALUES ($1, $2, $3)';
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
        db.query('SELECT uid, username, email, phone, balance FROM mybank WHERE username = $1', [username], (dbErr, results) => {
            if (dbErr) return res.status(500).json({ error: 'Database error' });
            if (results.rows.length === 0) return res.status(404).json({ error: 'User not found' });

            res.json(results.rows[0]);
        });
    });
});

// 5. Change Password
app.post('/api/change-password', (req, res) => {
    const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const { newPassword } = req.body;

    // Validation
    if (!newPassword || newPassword.length < 10) {
        return res.status(400).json({ error: 'Password must be at least 10 characters.' });
    }

    // Verify Token
    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid Token' });

        try {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            const username = decoded.username;

            db.query('UPDATE mybank SET password = $1 WHERE username = $2', [hashedPassword, username], (dbErr, result) => {
                if (dbErr) return res.status(500).json({ error: 'Database error' });
                res.json({ message: 'Password updated successfully' });
            });
        } catch (e) {
            res.status(500).json({ error: 'Server error' });
        }
    });
});

// Logout
app.post('/api/logout', (req, res) => {
    res.clearCookie('auth_token');
    res.json({ message: 'Logged out', redirect: '/login.html' });
});

// Export the app for Vercel
module.exports = app;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`MyBank Server running on http://localhost:${PORT}`);
    });
}
