const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { Server } = require('socket.io');
const http = require('http');
const path = require('path');

dotenv.config();

const app = express();
const server = http.createServer(app);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    // Allow any Vercel deployment
    if (!origin || origin.includes('vercel.app') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Serve static files from UI dist
app.use(express.static(path.join(__dirname, '../UI/dist')));

// Database connection
connectDB();

// Routes
const setupRoutes = require('./services/routeService');
const socketService = require('./services/socketService');
setupRoutes(app);

// Serve index.html for all non-API routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../UI/dist/index.html'));
});

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
  cors: corsOptions
});

// Initialize Socket Service
socketService(io);

// Start server
const PORT = process.env.PORT || 5000;

if (require.main === module) {
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
}

// Periodic cleanup of old meetings and participants
if (require.main === module) {
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
}

module.exports = app;