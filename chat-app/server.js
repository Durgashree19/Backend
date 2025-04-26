// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const db = require('./db');
const messageRoutes = require('./routes/messages');
const userRoutes = require('./routes/users');

require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
  },
});

app.use(cors({
  origin: 'http://localhost:3000', // frontend URL
  credentials: true,
}));

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);

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


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
