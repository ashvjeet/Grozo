require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');
const socketHandler = require('./sockets/socketHandler');

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

app.set('io', io);
socketHandler(io);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/delivery', require('./routes/deliveryRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files in production (but NOT on Vercel, since Vercel handles static routing natively)
if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
  app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));
  app.get('(.*)', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
  });
}

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Only start the server locally, otherwise export for Vercel Serverless
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`
    🛒 ═══════════════════════════════════════════
       GROZO SERVER - Smart Grocery Platform
    ═══════════════════════════════════════════════
    🚀 Server running on port ${PORT}
    📡 Socket.io ready for real-time updates
    🌐 API: http://localhost:${PORT}/api
    ═══════════════════════════════════════════════
    `);
  });
}

module.exports = app;
