import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  id: String,
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  portion: String,
  spice: String
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  },
  customerName: { 
    type: String, 
    required: true 
  },
  customerPhone: { 
    type: String, 
    required: true 
  },
  customerAddress: { 
    type: String, 
    required: true 
  },
  deliveryType: { 
    type: String, 
    enum: ['Delivery', 'Takeaway', 'Dine In'], 
    default: 'Delivery' 
  },
  paymentMethod: { 
    type: String, 
    default: 'Cash on Delivery' 
  },
  notes: { 
    type: String, 
    default: '' 
  },
  items: [orderItemSchema],
  subtotal: { 
    type: Number, 
    required: true, 
    default: 0 
  },
  deliveryFee: { 
    type: Number, 
    default: 0 
  },
  discount: { 
    type: Number, 
    default: 0 
  },
  total: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'preparing', 'on_the_way', 'delivered', 'cancelled'], 
    default: 'pending' 
  },
  riderName: { 
    type: String, 
    default: 'Farhan Tariq (Rider #14)' 
  },
  riderPhone: { 
    type: String, 
    default: '0315-7788990' 
  },
  riderBike: { 
    type: String, 
    default: 'Honda CG 125 (BDN-992)' 
  },
  estimatedMinutes: { 
    type: Number, 
    default: 35 
  },
  statusTimestamps: {
    pending: String,
    preparing: String,
    on_the_way: String,
    delivered: String,
    cancelled: String
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;
