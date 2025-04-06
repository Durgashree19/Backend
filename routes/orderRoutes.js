const express = require('express');
const router = express.Router();
const db = require('../db');

// Place a new order
router.post('/', async (req, res) => {
  const { User_ID, Order_Items, Total_Amount, Shipping_ID } = req.body;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Insert into orders (single record)
    const [orderResult] = await conn.query(`
      INSERT INTO orders (User_ID, Order_Status, Total_Amount, Order_Date, Shipping_ID)
      VALUES (?, 'Pending', ?, NOW(), ?)`,
      [User_ID, Total_Amount, Shipping_ID]
    );

    const Order_ID = orderResult.insertId;

    for (const item of Order_Items) {
      const { Product_ID, Quantity, Size, Color } = item;

      const [product] = await conn.query(
        `SELECT Stock_Quantity, Price FROM products WHERE Product_ID = ?`,
        [Product_ID]
      );

      if (!product.length || product[0].Stock_Quantity < Quantity) {
        await conn.rollback();
        conn.release();
        return res.status(400).json({ error: `Insufficient stock for product ${Product_ID}` });
      }

      const Subtotal = product[0].Price * Quantity;

      await conn.query(`
        INSERT INTO order_items (Order_ID, Product_ID, Quantity, Size, Color, Subtotal)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [Order_ID, Product_ID, Quantity, Size, Color, Subtotal]
      );

      await conn.query(`
        UPDATE products SET Stock_Quantity = Stock_Quantity - ? WHERE Product_ID = ?`,
        [Quantity, Product_ID]
      );
    }

    await conn.commit();
    res.status(201).json({ message: 'Order placed successfully', Order_ID });

  } catch (err) {
    await conn.rollback();
    console.error('Order placement failed:', err.message);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// Fetch all orders by a user
router.get('/user/:userId', async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT * FROM orders WHERE User_ID = ? ORDER BY Order_Date DESC`,
      [req.params.userId]
    );
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch items in a specific order
router.get('/:orderId/items', async (req, res) => {
  try {
    const [items] = await db.query(
      `SELECT oi.*, p.Name, p.Price
       FROM order_items oi
       JOIN products p ON oi.Product_ID = p.Product_ID
       WHERE oi.Order_ID = ?`,
      [req.params.orderId]
    );
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
