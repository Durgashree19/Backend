const express = require('express');
const router = express.Router();
const db = require('../db'); // Ensure this is mysql2/promise pool

// CREATE a product
router.post('/', async (req, res) => {
  const {
    Name,
    Description,
    Price,
    Stock_Quantity,
    Rating,
    Size,
    Color,
    AI_Tagging,
    Category_ID,
    Brand_ID,
    Seller_ID
  } = req.body;

  console.log('📥 Incoming:', req.body);

  const query = `
    INSERT INTO products (
      Name, Description, Price, Stock_Quantity, Rating, Size, Color,
      AI_Tagging, Category_ID, Brand_ID, Seller_ID
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    Name,
    Description,
    Price,
    Stock_Quantity,
    Rating,
    Size,
    Color,
    JSON.stringify(AI_Tagging),
    Category_ID,
    Brand_ID,
    Seller_ID
  ];

  try {
    const [result] = await db.query(query, values);
    console.log('✅ DB Inserted:', result);
    return res.status(201).json({ message: 'Product added', productId: result.insertId });
  } catch (err) {
    console.error('❌ DB Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// READ all products
router.get('/', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM products');
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ one product by ID
router.get('/:id', async (req, res) => {
  try {
    const [result] = await db.query('SELECT * FROM products WHERE Product_ID = ?', [req.params.id]);
    if (result.length === 0) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE a product
router.put('/:id', async (req, res) => {
  try {
    const {
      Name,
      Description,
      Price,
      Stock_Quantity,
      Rating,
      Size,
      Color,
      AI_Tagging,
      Category_ID,
      Brand_ID,
      Seller_ID
    } = req.body;

    const query = `
      UPDATE products SET
        Name = ?, Description = ?, Price = ?, Stock_Quantity = ?, Rating = ?, Size = ?, Color = ?,
        AI_Tagging = ?, Category_ID = ?, Brand_ID = ?, Seller_ID = ?
      WHERE Product_ID = ?
    `;

    const values = [
      Name,
      Description,
      Price,
      Stock_Quantity,
      Rating,
      Size,
      Color,
      JSON.stringify(AI_Tagging),
      Category_ID,
      Brand_ID,
      Seller_ID,
      req.params.id
    ];

    await db.query(query, values);
    res.status(200).json({ message: 'Product updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a product
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM products WHERE Product_ID = ?', [req.params.id]);
    res.status(200).json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
