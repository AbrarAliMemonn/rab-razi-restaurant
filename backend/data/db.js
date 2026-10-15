import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USERS_FILE = path.join(__dirname, 'users.json');
const ORDERS_FILE = path.join(__dirname, 'orders.json');

// Initial demo users
const INITIAL_USERS = [
  {
    id: 'usr-101',
    name: 'Muhammad Bilal',
    email: 'customer@rabrazi.com',
    phone: '0300-1234567',
    passwordHash: bcrypt.hashSync('customer123', 10),
    role: 'customer',
    addresses: [
      {
        id: 'addr-1',
        label: 'Home',
        address: 'House 14, Near Shahi Bazaar, Tando Bago, Sindh',
        isDefault: true
      },
      {
        id: 'addr-2',
        label: 'Office / Shop',
        address: 'Shop 22, Station Road, Tando Bago, Sindh',
        isDefault: false
      }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-admin',
    name: 'Rab Razi Admin',
    email: 'admin@rabrazi.com',
    phone: '0312-9876543',
    passwordHash: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    addresses: [
      {
        id: 'addr-admin-1',
        label: 'Restaurant Branch',
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
