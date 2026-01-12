const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { Server } = require('socket.io');
const http = require('http');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
connectDB();

// Routes
const setupRoutes = require('./services/routeService');
const socketService = require('./services/socketService');
setupRoutes(app);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle duplicate key error (MongoDB)
  if (err.code === 11000) {
    return res.status(400).json({ message: 'Meeting ID already exists' });
  }
  
  res.status(500).json({ message: err.message || 'Internal server error' });
});

// WebSocket setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Initialize Socket Service
socketService(io);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = (port) => {
  server.listen(port, () => {
    console.log(`Server running on port ${server.address().port}`);
  });
};

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is busy, retrying on a random port...`);
    setTimeout(() => {
      server.close();
      startServer(0);
    }, 1000);
  } else {
    console.error('Server error:', e);
  }
});

startServer(PORT);

// Periodic cleanup of old meetings and participants
setInterval(async () => {
  try {
    const Meeting = require('./models/Meeting');
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Clean up old meetings (older than 1 hour with no activity)
    await Meeting.deleteMany({
      updatedAt: { $lt: oneHourAgo },
      participants: { $size: 0 }
    });

    console.log('Cleanup completed');
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}, 60 * 60 * 1000); // Run every hour

module.exports = { io };