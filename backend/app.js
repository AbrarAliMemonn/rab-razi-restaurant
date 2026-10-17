import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import { connectDB } from './config/db.js';

dotenv.config();

const app = express();

// Connect to MongoDB if MONGODB_URI is provided
connectDB();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/menu', menuRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Rab Razi Restaurant API',
    location: 'Tando Bago, Sindh, Pakistan',
    timestamp: new Date().toISOString()
  });
});

// Root welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Rab Razi Restaurant Backend API',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        profile: 'PUT /api/auth/profile',
        addAddress: 'POST /api/auth/address'
      },
      orders: {
        getAll: 'GET /api/orders',
        getOne: 'GET /api/orders/:id',
        create: 'POST /api/orders',
        updateStatus: 'PATCH /api/orders/:id/status'
      },
      menu: {
        getAll: 'GET /api/menu',
        getOne: 'GET /api/menu/:id'
      },
      health: 'GET /api/health'
    }
  });
});

export default app;
