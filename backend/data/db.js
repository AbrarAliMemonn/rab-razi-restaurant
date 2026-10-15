import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USERS_FILE = path.join(__dirname, 'users.json');
const ORDERS_FILE = path.join(__dirname, 'orders.json');

// Admin email configured per requirement
export const ADMIN_EMAIL = 'abraralimemon23@gmail.com';

// Pre-seeded Admin account (no demo accounts)
const INITIAL_USERS = [
  {
    id: 'usr-admin-abrar',
    name: 'Abrar Ali Memon',
    email: 'abraralimemon23@gmail.com',
    phone: '0300-1234567',
    passwordHash: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    addresses: [
      {
        id: 'addr-admin-1',
        label: 'Restaurant Headquarters',
        address: 'Main Badin-Mirpurkhas Road, Tando Bago, Sindh',
        isDefault: true
      }
    ],
    createdAt: new Date().toISOString()
  }
];

// Helper to ensure files exist
function ensureFiles() {
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(INITIAL_USERS, null, 2), 'utf-8');
  } else {
    // If users.json exists, verify abraralimemon23@gmail.com is present with role admin
    try {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      const users = JSON.parse(data);
      const hasAdmin = users.find((u) => u.email?.toLowerCase() === ADMIN_EMAIL);
      if (!hasAdmin) {
        users.unshift(INITIAL_USERS[0]);
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
      }
    } catch {}
  }

  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

ensureFiles();

export function getUsers() {
  try {
    ensureFiles();
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading users.json:', err);
    return [];
  }
}

export function saveUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error saving users.json:', err);
    return false;
  }
}

export function getOrders() {
  try {
    ensureFiles();
    const data = fs.readFileSync(ORDERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading orders.json:', err);
    return [];
  }
}

export function saveOrders(orders) {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error saving orders.json:', err);
    return false;
  }
}
