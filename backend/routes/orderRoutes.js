import express from 'express';
import { getAllOrders, getOrderById, createOrder, updateOrderStatus } from '../controllers/orderController.js';
import { authenticateToken, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Strict Auth for viewing all orders (admin sees all, customer sees only their own)
router.get('/', authenticateToken, getAllOrders);

// View individual order by ID (customer order tracking)
router.get('/:id', getOrderById);

// Create order (supports authenticated users or guests)
router.post('/', optionalAuth, createOrder);

// Update order status (Admin & Rider only)
router.patch('/:id/status', authenticateToken, updateOrderStatus);
router.put('/:id/status', authenticateToken, updateOrderStatus);

export default router;
