import jwt from 'jsonwebtoken';
import { getUsers } from '../data/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'rab_razi_jwt_super_secret_key_2026_tando_bago';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const users = getUsers();
    const user = users.find((u) => u.id === decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found or session expired.' });
    }

    const { passwordHash, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
  }
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const users = getUsers();
    const user = users.find((u) => u.id === decoded.id);
    if (user) {
      const { passwordHash, ...userWithoutPassword } = user;
      req.user = userWithoutPassword;
    } else {
      req.user = null;
    }
  } catch {
    req.user = null;
  }
  next();
}
