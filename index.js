const express = require("express");
const cors = require("cors");
const db = require("./db");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import Routes
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require('./routes/categoryRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const cartRoutes = require('./routes/cartRoutes');
const favouriteRoutes = require('./routes/favouriteRoutes');
const orderRoutes = require('./routes/orderRoutes');


app.use("/api/auth", authRoutes); // Route for authentication
app.use('/api/products', productRoutes); // Route for products
app.use('/api/categories', categoryRoutes);  // Route for category
app.use('/api/sellers', sellerRoutes); // Route for seller
app.use('/api/cart', cartRoutes); // Route for cart
app.use('/api/favourites', favouriteRoutes); // Route for favourites
app.use('/api/orders', orderRoutes);  // Route for MyOrders


app.use((req, res, next) => {
  console.log('Unhandled request:', req.method, req.url);
  res.status(404).json({ message: 'Not found' });
});


// Start Server
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
