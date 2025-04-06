const express = require('express');
const router = express.Router();
const db = require('../db');

// ✅ Add to favourites
router.post('/', async (req, res) => {
  try {
    const { User_ID, Product_ID } = req.body;
    await db.query(
      `INSERT IGNORE INTO favourites (User_ID, Product_ID) VALUES (?, ?)`,
      [User_ID, Product_ID]
    );
    res.status(201).json({ message: 'Added to favourites' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get all favourites for a user
router.get('/:userId', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT f.Favourite_ID, p.* FROM favourites f
       JOIN products p ON f.Product_ID = p.Product_ID
       WHERE f.User_ID = ?`,
      [req.params.userId]
    );
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Remove a specific product from favourites
router.delete('/', async (req, res) => {
  try {
    const { User_ID, Product_ID } = req.body;
    await db.query(
      `DELETE FROM favourites WHERE User_ID = ? AND Product_ID = ?`,
      [User_ID, Product_ID]
    );
    res.status(200).json({ message: 'Removed from favourites' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Clear all favourites for a user
router.delete('/user/:userId', async (req, res) => {
  try {
    await db.query(`DELETE FROM favourites WHERE User_ID = ?`, [req.params.userId]);
    res.status(200).json({ message: 'All favourites cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
