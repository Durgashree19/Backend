const express = require('express');
const router = express.Router();
const db = require('../db');

// ==========================
// Search-based Recommendations
// ==========================
router.get('/search/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Fetch recent search queries
    const [searches] = await db.query(
      `SELECT Search_Query 
       FROM search_history 
       WHERE User_ID = ? 
       ORDER BY Search_Timestamp DESC 
       LIMIT 5`,
      [userId]
    );

    if (searches.length === 0) {
      return res.status(200).json({ message: 'No search history found.' });
    }

    // Build LIKE clauses
    const queries = searches.map(row => `%${row.Search_Query}%`);
    const conditions = queries.map(() => `(Name LIKE ? OR Description LIKE ? OR JSON_EXTRACT(AI_Tagging, '$') LIKE ?)`).join(' OR ');
    const values = queries.flatMap(q => [q, q, q]);

    const [recommended] = await db.query(
      `SELECT * FROM products 
       WHERE ${conditions} 
       LIMIT 10`,
      values
    );

    res.status(200).json(recommended);
  } catch (error) {
    console.error('Search-based recommendation error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// ===============================
// Related Product Recommendations
// ===============================
router.get('/related/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;

    // Fetch current product details
    const [[product]] = await db.query(
      `SELECT * FROM products WHERE Product_ID = ?`,
      [productId]
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Parse AI_Tagging JSON
    const tags = JSON.parse(product.AI_Tagging || '[]');
    const tagConditions = tags.map(() => `JSON_CONTAINS(AI_Tagging, ?, '$')`).join(' OR ');
    const tagValues = tags.map(tag => `"${tag}"`);

    // Build base query
    let query = `
      SELECT * FROM products 
      WHERE Product_ID != ? 
      AND Category_ID = ? 
      AND Color = ?
    `;
    let values = [product.Product_ID, product.Category_ID, product.Color];

    // Add AI tag filter if available
    if (tags.length > 0) {
      query += ` AND (${tagConditions})`;
      values = [...values, ...tagValues];
    }

    query += ` LIMIT 10`;

    const [relatedProducts] = await db.query(query, values);
    res.status(200).json(relatedProducts);
  } catch (error) {
    console.error('Related product recommendation error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;
