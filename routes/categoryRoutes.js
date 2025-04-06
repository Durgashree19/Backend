const express = require('express');
const router = express.Router();
const db = require('../db'); // db is a pool.promise()

// CREATE a category
router.post('/', async (req, res) => {
  const { Category_Name, Parent_Category_ID } = req.body;

  const sql = `
    INSERT INTO categories (Category_Name, Parent_Category_ID)
    VALUES (?, ?)
  `;

  try {
    const [result] = await db.query(sql, [Category_Name, Parent_Category_ID]);
    res.status(201).json({ message: 'Category created', Category_ID: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Category name already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// READ all categories
router.get('/', async (req, res) => {
  try {
    const [categories] = await db.query('SELECT * FROM categories');
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ a single category by ID
router.get('/:id', async (req, res) => {
  try {
    const [result] = await db.query('SELECT * FROM categories WHERE Category_ID = ?', [req.params.id]);
    if (result.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE a category
router.put('/:id', async (req, res) => {
  const { Category_Name, Parent_Category_ID } = req.body;

  const sql = `
    UPDATE categories
    SET Category_Name = ?, Parent_Category_ID = ?
    WHERE Category_ID = ?
  `;

  try {
    const [result] = await db.query(sql, [Category_Name, Parent_Category_ID, req.params.id]);
    res.status(200).json({ message: 'Category updated' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Category name already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE a category
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM categories WHERE Category_ID = ?', [req.params.id]);
    res.status(200).json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
