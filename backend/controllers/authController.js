import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getUsers, saveUsers, ADMIN_EMAIL } from '../data/db.js';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'rab_razi_jwt_super_secret_key_2026_tando_bago';

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id || user._id,
      email: user.email,
      phone: user.phone,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

// POST /api/auth/register
export async function register(req, res) {
  try {
    const { name, email, phone, password, address } = req.body;

    if (!name || !password || (!email && !phone)) {
      return res.status(400).json({
        success: false,
        message: 'Name, password, and at least one contact (email or phone) are required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.'
      });
    }

    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const cleanPhone = phone ? phone.trim() : '';
    const isAdmin = cleanEmail === ADMIN_EMAIL.toLowerCase();
    const role = isAdmin ? 'admin' : 'customer';

    const users = getUsers();

    // Check duplicate
    const existing = users.find(
      (u) => (cleanEmail && u.email?.toLowerCase() === cleanEmail) || 
             (cleanPhone && u.phone === cleanPhone)
    );

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email or phone number already exists.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUserId = `usr-${Date.now().toString().slice(-6)}`;

    const newUser = {
      id: newUserId,
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      passwordHash: hashedPassword,
      role,
      addresses: address ? [
        {
          id: `addr-${Date.now()}`,
          label: 'Default Address',
          address: address.trim(),
          isDefault: true
        }
      ] : [],
      createdAt: new Date().toISOString()
    };

    // Save in file store
    users.push(newUser);
    saveUsers(users);

    // Also attempt MongoDB save if connected
    try {
      if (User.db?.readyState === 1) {
        await User.create({
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          password: hashedPassword,
          role: newUser.role,
          addresses: newUser.addresses
        });
      }
    } catch (dbErr) {
      // MongoDB non-blocking
    }

    const token = generateToken(newUser);
    const { passwordHash, ...safeUser } = newUser;

    return res.status(201).json({
      success: true,
      message: isAdmin 
        ? 'Welcome Admin! Abrar Ali Memon account registered successfully.'
        : `Account created successfully! Welcome ${safeUser.name}.`,
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
}

// POST /api/auth/login
export async function login(req, res) {
  try {
    const { identifier, password } = req.body; // email or phone

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email/phone and password.'
      });
    }

    const cleanId = identifier.trim().toLowerCase();
    const users = getUsers();

    let user = users.find(
      (u) => u.email?.toLowerCase() === cleanId || 
             u.phone === identifier.trim() || 
             u.phone.replace(/[^0-9]/g, '') === identifier.trim().replace(/[^0-9]/g, '')
    );

    // If not found in file store, check MongoDB if connected
    if (!user) {
      try {
        if (User.db?.readyState === 1) {
          const mongoUser = await User.findOne({
            $or: [{ email: cleanId }, { phone: identifier.trim() }]
          });
          if (mongoUser) {
            user = {
              id: mongoUser._id.toString(),
              name: mongoUser.name,
              email: mongoUser.email,
              phone: mongoUser.phone,
              passwordHash: mongoUser.password,
              role: mongoUser.role,
              addresses: mongoUser.addresses
            };
          }
        }
      } catch (err) {}
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/phone or password.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/phone or password.'
      });
    }

    // Ensure role is admin if abraralimemon23@gmail.com
    if (user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      user.role = 'admin';
    }

    const token = generateToken(user);
    const { passwordHash, ...safeUser } = user;

    return res.json({
      success: true,
      message: `Welcome back, ${safeUser.name}!`,
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
}

// GET /api/auth/me
export function getMe(req, res) {
  return res.json({
    success: true,
    user: req.user
  });
}

// PUT /api/auth/profile
export async function updateProfile(req, res) {
  try {
    const { name, phone, email, addresses } = req.body;
    const users = getUsers();
    const userIndex = users.findIndex((u) => u.id === req.user.id);

    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = users[userIndex];
    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (email) user.email = email.trim().toLowerCase();
    if (Array.isArray(addresses)) user.addresses = addresses;

    if (user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      user.role = 'admin';
    }

    users[userIndex] = user;
    saveUsers(users);

    const { passwordHash, ...safeUser } = user;
    return res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: safeUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating profile.' });
  }
}

// POST /api/auth/address
export function addAddress(req, res) {
  try {
    const { label, address, isDefault } = req.body;
    if (!address) {
      return res.status(400).json({ success: false, message: 'Address text is required.' });
    }

    const users = getUsers();
    const userIndex = users.findIndex((u) => u.id === req.user.id);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = users[userIndex];
    if (!user.addresses) user.addresses = [];

    if (isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }

    const newAddr = {
      id: `addr-${Date.now()}`,
      label: label || 'Delivery Address',
      address: address.trim(),
      isDefault: Boolean(isDefault || user.addresses.length === 0)
    };

    user.addresses.push(newAddr);
    users[userIndex] = user;
    saveUsers(users);

    const { passwordHash, ...safeUser } = user;
    return res.json({
      success: true,
      message: 'Address added successfully!',
      user: safeUser
    });
  } catch (error) {
    console.error('Add address error:', error);
    return res.status(500).json({ success: false, message: 'Server error adding address.' });
  }
}
