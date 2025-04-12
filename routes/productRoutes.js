const express = require('express');
const router = express.Router();
const db = require('../db');

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
  
    console.log('📥 Incoming Product POST Request:', req.body);
  
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
      console.log('✅ Insert Success:', result);
      return res.status(201).json({ message: 'Product created', productId: result.insertId });
    } catch (err) {
      console.error('❌ DB Error:', err.message);
      return res.status(500).json({ error: err.message });
    }
  });
  
  
// READ all products
router.get('/', (req, res) => {
  db.query('SELECT * FROM products', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(results);
  });
});

// READ one product by Product_ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const [rows] = await db.query(
        'SELECT * FROM products WHERE Product_ID = ?',
        [id]
      );
  
      if (rows.length === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      res.status(200).json(rows[0]);
    } catch (err) {
      console.error('❌ Error fetching product by ID:', err.message);
      res.status(500).json({ error: err.message });
    }
  });


// UPDATE a product
router.put('/:id', (req, res) => {
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

  const aiTaggingString = JSON.stringify(AI_Tagging); // 👈 again here too

  db.query(query, [
    Name,
    Description,
    Price,
    Stock_Quantity,
    Rating,
    Size,
    Color,
    aiTaggingString,
    Category_ID,
    Brand_ID,
    Seller_ID,
    req.params.id
  ], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ message: 'Product updated' });
  });
});

//UPLOAD Image

const upload = require('../upload');

router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    const { Product_ID, Color } = req.body;
    const imageBuffer = req.file.buffer;
    const mimeType = req.file.mimetype;

    await db.query(`
      INSERT INTO product_images (Product_ID, Color, Image_Data, MIME_Type)
      VALUES (?, ?, ?, ?)
    `, [Product_ID, Color, imageBuffer, mimeType]);

    res.status(201).json({ message: 'Image uploaded and saved in DB' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// Download Image

// router.get('/image/:id', async (req, res) => {
//     const [rows] = await db.query('SELECT Image_Data, MIME_Type FROM product_images WHERE Product_ID = ?', [req.params.id]);
//     if (rows.length === 0) return res.status(404).send('Image not found');
  
//     res.setHeader('Content-Type', rows[0].MIME_Type);
//     res.send(rows[0].Image_Data);
//   });

// router.get('/image/:id', async (req, res) => {
//     try {
//       const [rows] = await db.query(
//         'SELECT Image_Data, MIME_Type FROM product_images WHERE Product_ID = ?',
//         [req.params.id]
//       );
  
//       if (rows.length === 0) return res.status(404).send('No images found');
  
//       const images = rows.map(row => ({
//         mimeType: row.MIME_Type,
//         base64: row.Image_Data.toString('base64'),
//       }));
  
//       res.status(200).json(images);
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   });
  

// Get all image URLs for a product
router.get('/images/:productId', async (req, res) => {
    try {
      const { productId } = req.params;
  
      const [rows] = await db.query(
        `SELECT Color FROM product_images WHERE Product_ID = ?`,
        [productId]
      );
  
      if (rows.length === 0) {
        return res.status(404).json({ message: 'No images found for this product' });
      }
  
      const imageUrls = rows.map(row => 
        `http://localhost:8081/api/products/image/${productId}?color=${encodeURIComponent(row.Color)}`
      );
  
      res.status(200).json({ images: imageUrls });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.get('/image/:id', async (req, res) => {
    const productId = req.params.id;
    const color = req.query.color;
  
    const [rows] = await db.query(
      `SELECT Image_Data, MIME_Type FROM product_images WHERE Product_ID = ? AND Color = ? LIMIT 1`,
      [productId, color]
    );
  
    if (rows.length === 0) return res.status(404).send('Image not found');
  
    res.setHeader('Content-Type', rows[0].MIME_Type);
    res.send(rows[0].Image_Data);
  });
  

// DELETE a product
router.delete('/:id', (req, res) => {
  db.query('DELETE FROM products WHERE Product_ID = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ message: 'Product deleted' });
  });
});

// GET all products by Category_ID
router.get('/category/:categoryId', async (req, res) => {
    const { categoryId } = req.params;
  
    try {
      const [rows] = await db.query(
        `SELECT * FROM products WHERE Category_ID = ?`,
        [categoryId]
      );
  
      if (rows.length === 0) {
        return res.status(404).json({ message: 'No products found for this category' });
      }
  
      res.status(200).json(rows);
    } catch (err) {
      console.error('❌ Error fetching products by category:', err.message);
      res.status(500).json({ error: err.message });
    }
  });
  




module.exports = router;