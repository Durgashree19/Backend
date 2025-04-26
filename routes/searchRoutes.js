const express = require('express');
const router = express.Router();
const db = require('../db');

// @route   POST /api/search
// @desc    Log search query and return matched products
// @access  Public (or use middleware if needed)
router.post('/', async (req, res) => {
  try {
    const { userId, searchQuery } = req.body;

    if (!searchQuery || searchQuery.trim() === "") {
      return res.status(400).json({ message: "Search query cannot be empty." });
    }

    //  Validating userId before insertion
    if (userId) {
      await db.query(
        'INSERT INTO search_history (User_ID, Search_Query) VALUES (?, ?)',
        [userId, searchQuery]
      );
    }

    // Search products by name, description, or AI tags
    const likeQuery = `%${searchQuery}%`;
    const [results] = await db.query(
      `SELECT * FROM products 
       WHERE Name LIKE ? 
       OR Description LIKE ? 
       OR JSON_EXTRACT(AI_Tagging, '$') LIKE ?`,
      [likeQuery, likeQuery, likeQuery]
    );

    if (results.length === 0) {
      return res.status(200).json({ message: "No products found for this search." });
    }

    res.status(200).json(results);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Server error while performing search." });
  }
});

module.exports = router;
