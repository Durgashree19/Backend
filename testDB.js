const db = require('./db');

async function testConnection() {
  try {
    const [rows] = await db.query('SELECT 1');
    console.log('✅ MySQL Connected Successfully!');
    console.log('Response:', rows);
  } catch (err) {
    console.error('❌ DB Connection Failed:', err.message);
  } finally {
    process.exit(); // Ensure the script exits
  }
}

testConnection();
