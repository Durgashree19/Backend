// routes/messages.js
const express = require('express');
const db = require('../db');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

// GET /api/messages/users
router.get('/users', authenticateToken, async (req, res) => {
    const currentUserId = req.user.userId;
    console.log('UserID In messages:', currentUserId);
  
    try {
      const [results] = await db.query('SELECT * FROM users WHERE User_ID != ?', [currentUserId]);
      res.json(results);
    } catch (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: 'Database error' });
    }
  });
  


// Get messages between two users
// GET /api/messages/:userId?currentUserId={currentUser}
router.get('/:userId', authenticateToken, async (req, res) => {
    const otherUserId = req.params.userId;
    const currentUserId = req.query.currentUserId;
  
    console.log('otherUserId:', otherUserId);
    console.log('currentUserId:', currentUserId);
  
    const query = `
      SELECT * FROM messages
      WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
      ORDER BY timestamp ASC
    `;
  
    try {
      const [results] = await db.query(query, [currentUserId, otherUserId, otherUserId, currentUserId]);
      res.json(results);
    } catch (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: 'Database error' });
    }
  });
  
  

module.exports = router;
