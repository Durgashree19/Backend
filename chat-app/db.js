// db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'shopper',
  port: '3308',
  connectionLimit: 10, // Adjust based on load
});

module.exports = db;
