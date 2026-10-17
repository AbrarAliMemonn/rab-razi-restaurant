import { getOrders, saveOrders } from '../data/db.js';

// GET /api/orders - STRICT AUTHENTICATION REQUIRED
export function getAllOrders(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to view orders.'
      });
    }

    const orders = getOrders();

    // 1. Admin can view ALL orders
    if (req.user.role === 'admin') {
      return res.json({
        success: true,
        count: orders.length,
        orders
      });
    }

    // 2. Rider can view their assigned orders or active deliveries
    if (req.user.role === 'rider') {
      const riderOrders = orders.filter(
        (o) =>
          o.riderId === req.user.id ||
          (req.user.phone && o.riderPhone === req.user.phone) ||
          o.status === 'on_the_way' ||
          o.status === 'preparing'
      );
      return res.json({
        success: true,
        count: riderOrders.length,
        orders: riderOrders
      });
    }

    // 3. Customers can STRICTLY view only their own orders
    const userOrders = orders.filter(
      (o) =>
        (o.userId && o.userId === req.user.id) ||
        (req.user.phone && o.customerPhone === req.user.phone) ||
        (req.user.email && o.customerEmail && o.customerEmail.toLowerCase() === req.user.email.toLowerCase())
    );

    return res.json({
      success: true,
      count: userOrders.length,
      orders: userOrders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving orders.' });
  }
}

// GET /api/orders/:id - View specific order by tracking ID
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

// POST /api/orders - Create a new order
export function createOrder(req, res) {
  try {
    const orderData = req.body;
    const now = new Date();
    const newOrderId = orderData.id || `RRR-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = {
      id: newOrderId,
      userId: req.user ? req.user.id : (orderData.userId || null),
      customerEmail: req.user ? req.user.email : (orderData.customerEmail || ''),
      customerName: orderData.customerName || (req.user ? req.user.name : 'Valued Customer'),
      customerPhone: orderData.customerPhone || (req.user ? req.user.phone : ''),
      customerAddress: orderData.customerAddress || 'Tando Bago, Sindh',
      deliveryType: orderData.deliveryType || 'Delivery',
      paymentMethod: orderData.paymentMethod || 'Cash on Delivery',
      transactionId: orderData.transactionId || '',
      notes: orderData.notes || '',
      items: Array.isArray(orderData.items) ? orderData.items : [],
      subtotal: Number(orderData.subtotal) || 0,
      deliveryFee: Number(orderData.deliveryFee) || 0,
      discount: Number(orderData.discount) || 0,
      total: Number(orderData.total) || 0,
      status: 'pending', // Awaiting kitchen/admin approval
      riderName: orderData.riderName || 'Farhan Tariq (Rider #14)',
      riderPhone: orderData.riderPhone || '0315-7788990',
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

// PATCH & PUT /api/orders/:id/status - Update order status (Admin & Rider only)
export function updateOrderStatus(req, res) {
  try {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'rider')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Admin or Rider privileges required to update order status.'
      });
    }

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
