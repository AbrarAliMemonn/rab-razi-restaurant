import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  itemId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  originalPrice: Number,
  isDeal: { 
    type: Boolean, 
    default: false 
  },
  discountPercentage: Number,
  description: String,
  image: String,
  tags: [String],
  inStock: { 
    type: Boolean, 
    default: true 
  },
  rating: { 
    type: Number, 
    default: 4.8 
  },
  reviewsCount: { 
    type: Number, 
    default: 120 
  },
  spicyLevel: { 
    type: String, 
    default: 'Medium' 
  },
  serves: String,
  portionOptions: [String]
});

const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', menuItemSchema);
export default MenuItem;
