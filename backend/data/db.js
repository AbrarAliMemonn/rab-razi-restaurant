import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// On serverless platforms like Vercel, write to os.tmpdir() if local directory is read-only
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const dataDir = isServerless ? os.tmpdir() : __dirname;

const USERS_FILE = path.join(dataDir, 'rrr_users.json');
const ORDERS_FILE = path.join(dataDir, 'rrr_orders.json');

// Admin email configured via environment or default
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'abraralimemon23@gmail.com';

// Pre-seeded Admin account with bcrypt password
const INITIAL_USERS = [
  {
    id: 'usr-admin-abrar',
    name: 'Abrar Ali Memon',
    email: ADMIN_EMAIL,
    phone: '0300-9998877',
    passwordHash: bcrypt.hashSync(process.env.ADMIN_DEFAULT_PASSWORD || 'admin123', 10),
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

// In-memory persistent cache for serverless environments
let inMemoryUsers = [...INITIAL_USERS];
let inMemoryOrders = [];

// Helper to ensure files exist
function ensureFiles() {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify(INITIAL_USERS, null, 2), 'utf-8');
    } else {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      const users = JSON.parse(data);
      const hasAdmin = users.find((u) => u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());
      if (!hasAdmin) {
        users.unshift(INITIAL_USERS[0]);
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
      }
      inMemoryUsers = users;
    }
  } catch {
    // Read-only filesystem fallback
  }

  try {
    if (!fs.existsSync(ORDERS_FILE)) {
      fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2), 'utf-8');
    } else {
      const data = fs.readFileSync(ORDERS_FILE, 'utf-8');
      inMemoryOrders = JSON.parse(data);
    }
  } catch {
    // Read-only filesystem fallback
  }
}

ensureFiles();

export function getUsers() {
  try {
    ensureFiles();
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      inMemoryUsers = JSON.parse(data);
    }
  } catch (err) {
    // fallback to in-memory
  }
  return inMemoryUsers;
}

export function saveUsers(users) {
  inMemoryUsers = users;
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
    return true;
  } catch (err) {
    // in-memory persisted
    return true;
  }
}

export function getOrders() {
  try {
    ensureFiles();
    if (fs.existsSync(ORDERS_FILE)) {
      const data = fs.readFileSync(ORDERS_FILE, 'utf-8');
      inMemoryOrders = JSON.parse(data);
    }
  } catch (err) {
    // fallback to in-memory
  }
  return inMemoryOrders;
}

export function saveOrders(orders) {
  inMemoryOrders = orders;
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
    return true;
  } catch (err) {
    // in-memory persisted
    return true;
  }
}
