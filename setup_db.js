const { Client } = require('pg');
require('dotenv').config();

// Connect to the default 'postgres' database to create the new one
const client = new Client({
    host: 'localhost',
    user: 'postgres',
    password: process.env.DB_PASSWORD, // Ensure this matches your .env
    port: 5432,
    database: 'postgres' // Default database that always exists
});

async function setup() {
    try {
        console.log("🔌 Connecting to PostgreSQL...");
        await client.connect();
        
        console.log("🔨 Creating database 'mybank'...");
        await client.query('CREATE DATABASE mybank');
        console.log("✅ Database 'mybank' created successfully!");
    } catch (err) {
        if (err.code === '42P04') {
            console.log("✅ Database 'mybank' already exists.");
        } else {
            console.error("❌ Error:", err.message);
            if (err.code === '28P01') console.log("👉 Fix: Check DB_PASSWORD in your .env file.");
            if (err.code === 'ECONNREFUSED') console.log("👉 Fix: PostgreSQL is not running. Did you install it?");
        }
    } finally {
        await client.end();
    }
}

setup();