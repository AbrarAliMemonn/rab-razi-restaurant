import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  label: { type: String, default: 'Home' },
  address: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
}, { _id: true });

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Please provide your full name'], 
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, 'Please provide an email address'], 
    unique: true, 
    lowercase: true, 
    trim: true 
  },
  phone: { 
    type: String, 
    required: [true, 'Please provide a contact phone number'], 
    trim: true 
  },
  password: { 
    type: String, 
    required: [true, 'Please provide a password'], 
    minlength: 6 
  },
  role: { 
    type: String, 
    enum: ['customer', 'admin', 'rider'], 
    default: 'customer' 
  },
  addresses: [addressSchema],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Auto-assign admin role if email matches abraralimemon23@gmail.com
userSchema.pre('save', function (next) {
  if (this.email && this.email.toLowerCase() === 'abraralimemon23@gmail.com') {
    this.role = 'admin';
  }
  next();
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
