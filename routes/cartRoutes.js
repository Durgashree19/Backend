const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all cart items for a user
router.get('/:userId', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT sc.*, p.Name, p.Price FROM shopping_cart sc
       JOIN products p ON sc.Product_ID = p.Product_ID
       WHERE sc.User_ID = ?`,
      [req.params.userId]
    );
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add to cart (with upsert logic)
router.post('/', async (req, res) => {
  try {
    const { User_ID, Product_ID, Quantity, Size, Color } = req.body;

    // Check if item already exists for same product, size, color
    const [existing] = await db.query(
      `SELECT * FROM shopping_cart WHERE User_ID = ? AND Product_ID = ? AND Size = ? AND Color = ?`,
      [User_ID, Product_ID, Size, Color]
    );

    if (existing.length > 0) {
      // Update quantity
      await db.query(
        `UPDATE shopping_cart SET Quantity = Quantity + ? WHERE Cart_ID = ?`,
        [Quantity, existing[0].Cart_ID]
      );
    } else {
      // Insert new item
      await db.query(
        `INSERT INTO shopping_cart (User_ID, Product_ID, Quantity, Size, Color)
         VALUES (?, ?, ?, ?, ?)`,
        [User_ID, Product_ID, Quantity, Size, Color]
      );
    }

    res.status(201).json({ message: 'Cart updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update cart item
router.put('/:cartId', async (req, res) => {
  try {
    const { Quantity, Size, Color } = req.body;
    await db.query(
      `UPDATE shopping_cart SET Quantity = ?, Size = ?, Color = ? WHERE Cart_ID = ?`,
      [Quantity, Size, Color, req.params.cartId]
    );
    res.status(200).json({ message: 'Cart item updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete cart item
router.delete('/:cartId', async (req, res) => {
  try {
    await db.query(`DELETE FROM shopping_cart WHERE Cart_ID = ?`, [req.params.cartId]);
    res.status(200).json({ message: 'Cart item deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Empty cart for a user
router.delete('/user/:userId', async (req, res) => {
  try {
    await db.query(`DELETE FROM shopping_cart WHERE User_ID = ?`, [req.params.userId]);
    res.status(200).json({ message: 'Cart emptied' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get total price of cart
router.get('/:userId/total', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT SUM(p.Price * sc.Quantity) AS TotalPrice
       FROM shopping_cart sc
       JOIN products p ON sc.Product_ID = p.Product_ID
       WHERE sc.User_ID = ?`,
      [req.params.userId]
    );
    res.status(200).json({ total: rows[0].TotalPrice || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
