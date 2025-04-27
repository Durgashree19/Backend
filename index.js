// const express = require("express");
// const cors = require("cors");
// const db = require("./db");
// require("dotenv").config();

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Import Routes
// const authRoutes = require("./routes/authRoutes");
// const productRoutes = require("./routes/productRoutes");
// const categoryRoutes = require('./routes/categoryRoutes');
// const sellerRoutes = require('./routes/sellerRoutes');
// const cartRoutes = require('./routes/cartRoutes');
// const favouriteRoutes = require('./routes/favouriteRoutes');
// const orderRoutes = require('./routes/orderRoutes');
// const shippingRoutes = require('./routes/shippingRoutes');


// app.use("/api/auth", authRoutes); // Route for authentication
// app.use('/api/products', productRoutes); // Route for products
// app.use('/api/categories', categoryRoutes);  // Route for category
// app.use('/api/sellers', sellerRoutes); // Route for seller
// app.use('/api/cart', cartRoutes); // Route for cart
// app.use('/api/favourites', favouriteRoutes); // Route for favourites
// app.use('/api/orders', orderRoutes);  // Route for MyOrders
// app.use('/api/shipping', shippingRoutes);  // Route for MyOrders


// app.use((req, res, next) => {
//   console.log('Unhandled request:', req.method, req.url);
//   res.status(404).json({ message: 'Not found' });
// });


// // Start Server
// const PORT = process.env.PORT || 8081;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });



const express = require("express");
const cors = require("cors");
const db = require("./db");
require("dotenv").config();
const http = require('http');
const socketIo = require('socket.io');
const app = express();

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Frontend origin
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
});
// ✅ CORS configuration
app.use(cors({
  origin: "http://localhost:3000", // your frontend URL
  credentials: true               // if you're using cookies, sessions, or auth headers
}));

// app.use(cors());
app.use(express.json());

// ✅ Routes
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require('./routes/categoryRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const cartRoutes = require('./routes/cartRoutes');
const favouriteRoutes = require('./routes/favouriteRoutes');
const orderRoutes = require('./routes/orderRoutes');
const shippingRoutes = require('./routes/shippingRoutes');
const searchRoutes = require('./routes/searchRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const messageRoutes = require('./routes/messages');
const userRoutes = require('./routes/users');

app.use("/api/auth", authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/favourites', favouriteRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);

// ✅ Fallback for unknown routes
app.use((req, res, next) => {
  console.log('Unhandled request:', req.method, req.url);
  res.status(404).json({ message: 'Not found' });
});

// Socket.IO
io.on('connection', (socket) => {
  console.log('🟢 New client connected');

  socket.on('send_message', async (data) => {
    const { sender_id, receiver_id, message } = data;
    const timestamp = new Date();
    console.log('DATA:',data)
    try {
      await db.execute(
        'INSERT INTO messages (sender_id, receiver_id, message, timestamp) VALUES (?, ?, ?, ?)',
        [sender_id, receiver_id, message, timestamp]
      );

      io.emit('receive_message', { sender_id, receiver_id, message, timestamp });
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected');
  });
});

// ✅ Start server
const PORT = process.env.PORT || 8081;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
