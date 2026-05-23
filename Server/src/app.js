// Load environment variables dynamically based on file location before any other imports
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Production environment variable injection fallbacks to ensure Railway works out-of-the-box
const fallbackEnv = {
  DATABASE_URL: "postgresql://postgres.xacjlxzwjivwxhheqnmr:Juxtapose%4085@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true",
  DIRECT_URL: "postgresql://postgres.xacjlxzwjivwxhheqnmr:Juxtapose%4085@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres",
  JWT_SECRET: "menumitrasecretjwttokenstring12345678901234567890123456789012",
  JWT_ADMIN_SECRET: "menumitraadminsecretjwttokenstring12345678901234567890123456789012",
  JWT_REFRESH_SECRET: "menumitrarefreshsecretjwttokenstring12345678901234567890123456789012",
  ADMIN_LOGIN_ID: "Jitu",
  ADMIN_EMAIL: "abhijit.jituwreath@gmail.com",
  ADMIN_PASSWORD: "admin123",
  NODE_ENV: "production"
};

for (const [key, value] of Object.entries(fallbackEnv)) {
  if (!process.env[key]) {
    process.env[key] = value;
  }
}

const express = require('express');

const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { rateLimit } = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');

const app = express();
const server = http.createServer(app);

// Initialize Prisma
const prisma = new PrismaClient();
app.set('prisma', prisma);

// Setup CORS Options dynamically to support multiple origins (Localhost, Vercel deployments, custom domains)
const allowedOrigins = [
  'http://localhost:3000',
  'https://menu-mitra.vercel.app'
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

const dynamicCorsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.includes(origin) || 
                      origin.endsWith('.vercel.app') || 
                      /^http:\/\/localhost:\d+$/.test(origin);
                      
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};

// Initialize Socket.io with dynamic CORS options
const io = socketIo(server, {
  cors: dynamicCorsOptions
});
app.set('io', io);

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Register room for Business Owner (by owner ID)
  socket.on('join_owner_room', (ownerId) => {
    socket.join(ownerId);
    console.log(`Socket ${socket.id} joined owner room: ${ownerId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Configure Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' }
});

// Middlewares
app.use(helmet({
  contentSecurityPolicy: false // Allow inline scripts for simpler frontend integration
}));
app.use(cors(dynamicCorsOptions));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiter to general API routes
app.use('/api/', apiLimiter);

// Import Route Handlers
const authRoutes = require('./routes/auth');
const ownerRoutes = require('./routes/owner');
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payment');
const subscriptionRoutes = require('./routes/subscription');
const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');
const printRoutes = require('./routes/print');
const qrRoutes = require('./routes/qr');

// Map API routes
app.use('/api/auth', authRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/print', printRoutes);
app.use('/api/qr', qrRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'MenuMitra API Server is running.', developer: 'Abhijit Kumar Misra' });
});

// Global 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Requested resource not found.' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'An internal server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start Server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`MenuMitra Server listening on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Developer: Abhijit Kumar Misra`);
  console.log(`===============================================`);
});

module.exports = { app, server };
