// shippingRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// ✅ POST - Save Shipping Info
router.post('/', async (req, res) => {
  const {
    User_ID,
    First_Name,
    Last_Name,
    Address_Line1,
    Address_Line2,
    City,
    Country,
    State,
    Zipcode,
    Optional_Notes,
    Save_Info
  } = req.body;

  try {
    await db.query(
      `INSERT INTO shipping_details 
        (User_ID, First_Name, Last_Name, Address_Line1, Address_Line2, City, Country, State, Zipcode, Optional_Notes, Save_Info)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        User_ID,
        First_Name,
        Last_Name,
        Address_Line1,
        Address_Line2,
        City,
        Country,
        State,
        Zipcode,
        Optional_Notes,
        Save_Info
      ]
    );
    res.status(200).json({ message: 'Shipping info saved successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET - Fetch Last Shipping Info for a User
router.get('/:userId', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM shipping_details WHERE User_ID = ? ORDER BY Created_At DESC LIMIT 1`,
      [req.params.userId]
    );
    res.status(200).json(rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;