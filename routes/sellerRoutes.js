const express = require('express');
const router = express.Router();
const db = require('../db'); // Must be mysql2/promise pool

// CREATE a new seller
router.post('/', async (req, res) => {
  try {
    const { User_ID, Store_Name, Store_Description, Contact_Number, Rating } = req.body;

    console.log('Request body:', req.body);

    const [result] = await db.query(`
      INSERT INTO sellers (User_ID, Store_Name, Store_Description, Contact_Number, Rating)
      VALUES (?, ?, ?, ?, ?)
    `, [User_ID, Store_Name, Store_Description, Contact_Number, Rating]);

    console.log('Insert successful:', result);
    res.status(201).json({ message: 'Seller created', Seller_ID: result.insertId });
  } catch (err) {
    console.error('Database error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// READ all sellers
router.get('/', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM sellers');
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ one seller by ID
router.get('/:id', async (req, res) => {
  try {
    const [result] = await db.query('SELECT * FROM sellers WHERE Seller_ID = ?', [req.params.id]);
    if (result.length === 0) return res.status(404).json({ message: 'Seller not found' });
    res.status(200).json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE a seller
router.put('/:id', async (req, res) => {
  try {
    const { Store_Name, Store_Description, Contact_Number, Rating } = req.body;
    await db.query(`
      UPDATE sellers
      SET Store_Name = ?, Store_Description = ?, Contact_Number = ?, Rating = ?
      WHERE Seller_ID = ?
    `, [Store_Name, Store_Description, Contact_Number, Rating, req.params.id]);

    res.status(200).json({ message: 'Seller updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a seller
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM sellers WHERE Seller_ID = ?', [req.params.id]);
    res.status(200).json({ message: 'Seller deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
