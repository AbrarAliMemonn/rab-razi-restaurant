import express from 'express';
import { getAllOrders, getOrderById, createOrder, updateOrderStatus } from '../controllers/orderController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', optionalAuth, getAllOrders);
router.get('/:id', getOrderById);
router.post('/', optionalAuth, createOrder);
router.patch('/:id/status', updateOrderStatus);

export default router;
