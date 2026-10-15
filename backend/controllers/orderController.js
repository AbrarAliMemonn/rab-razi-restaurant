import { getOrders, saveOrders } from '../data/db.js';

// GET /api/orders
export function getAllOrders(req, res) {
  try {
    const orders = getOrders();
    // If user is authenticated customer, filter their orders, unless admin
    if (req.user && req.user.role === 'customer') {
      const userOrders = orders.filter((o) => o.userId === req.user.id || o.customerPhone === req.user.phone);
      return res.json({ success: true, count: userOrders.length, orders: userOrders });
    }
    return res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error('Get orders error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving orders.' });
  }
}

// GET /api/orders/:id
export function getOrderById(req, res) {
  try {
    const { id } = req.params;
    const orders = getOrders();
    const order = orders.find((o) => o.id.toUpperCase() === id.toUpperCase());

    if (!order) {
      return res.status(404).json({ success: false, message: `Order #${id} not found.` });
    }

    return res.json({ success: true, order });
  } catch (error) {
    console.error('Get order by id error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving order.' });
  }
}

// POST /api/orders
export function createOrder(req, res) {
  try {
    const orderData = req.body;
    const now = new Date();
    const newOrderId = `RRR-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = {
      id: newOrderId,
      userId: req.user ? req.user.id : null,
      customerName: orderData.customerName || (req.user ? req.user.name : 'Valued Guest'),
      customerPhone: orderData.customerPhone || (req.user ? req.user.phone : '0300-0000000'),
      customerAddress: orderData.customerAddress || 'Tando Bago, Sindh',
      deliveryType: orderData.deliveryType || 'Delivery',
      paymentMethod: orderData.paymentMethod || 'Cash on Delivery',
      notes: orderData.notes || '',
      items: orderData.items || [],
      subtotal: orderData.subtotal || 0,
      deliveryFee: orderData.deliveryFee || 0,
      discount: orderData.discount || 0,
      total: orderData.total || 0,
      status: 'pending', // Awaiting admin approval
      riderName: orderData.riderName || 'Farhan Tariq (Rider #14)',
      riderPhone: orderData.riderPhone || '0312-9876543',
      riderBike: orderData.riderBike || 'Honda CG 125 (BDN-992)',
      estimatedMinutes: orderData.deliveryType === 'Takeaway' ? 20 : 35,
      createdAt: now.toISOString(),
      statusTimestamps: {
        pending: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    };

    const orders = getOrders();
    orders.unshift(newOrder);
    saveOrders(orders);

    return res.status(201).json({
      success: true,
      message: `Order #${newOrderId} placed successfully! Status: Pending Approval.`,
      order: newOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({ success: false, message: 'Server error placing order.' });
  }
}

// PATCH /api/orders/:id/status
export function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'pending' | 'preparing' | 'on_the_way' | 'delivered' | 'cancelled'

    if (!status) {
      return res.status(400).json({ success: false, message: 'New status is required.' });
    }

    const orders = getOrders();
    const orderIndex = orders.findIndex((o) => o.id.toUpperCase() === id.toUpperCase());

    if (orderIndex === -1) {
      return res.status(404).json({ success: false, message: `Order #${id} not found.` });
    }

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const order = orders[orderIndex];

    order.status = status;
    order.statusTimestamps = {
      ...(order.statusTimestamps || {}),
      [status]: now
    };

    orders[orderIndex] = order;
    saveOrders(orders);

    return res.json({
      success: true,
      message: `Order #${id} status updated to ${status}.`,
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating order status.' });
  }
}
