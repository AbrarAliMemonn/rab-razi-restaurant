import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// On serverless platforms like Vercel, write to os.tmpdir() because source directories are read-only
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const dataDir = isServerless ? os.tmpdir() : __dirname;

const USERS_FILE = path.join(dataDir, 'rrr_users.json');
const ORDERS_FILE = path.join(dataDir, 'rrr_orders.json');
const SETTINGS_FILE = path.join(dataDir, 'rrr_settings.json');
const MENU_FILE = path.join(dataDir, 'rrr_menu.json');

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

// Initial dynamic restaurant settings
export const INITIAL_SETTINGS = {
  restaurantName: 'Rab Razi Restaurant',
  tagline: 'Taste of Blessing & Royal Hospitality',
  phone: '0300-9998877',
  whatsapp: '0300-9998877',
  whatsappRaw: '923009998877',
  address: 'Main Badin-Mirpurkhas Road, Tando Bago, Sindh',
  city: 'Tando Bago',
  district: 'Badin',
  province: 'Sindh',
  plusCode: 'QXQ6+C96',
  fullPlusCode: '7JPCQXQ6+C96',
  googleMapsUrl: 'https://maps.app.goo.gl/j9TWCvYC6UaRACuf8',
  latitude: 24.788538,
  longitude: 68.960891,
  isOpen: true,
  openingHours: '12:00 PM – 02:00 AM',
  deliveryFee: 80,
  freeDeliveryThreshold: 1500,
  deliveryRadiusText: 'Tando Bago City & Surrounding Areas (Within 5 km radius)',
  estimatedDeliveryTime: '25-35 min',
  promoCode: 'RAZI20',
  promoDiscountPercent: 20,
  announcement: '🎉 Rab Razi Restaurant, Tando Bago: Flat 20% OFF using code "RAZI20" on all orders!',
  customPaymentInstructions: 'Please share screenshot on WhatsApp with your Order ID for instant payment verification.',
  paymentMethods: {
    cod: {
      enabled: true,
      title: 'Cash on Delivery',
      instructions: 'Pay in cash to the rider upon delivery at your doorstep.'
    },
    jazzCash: {
      enabled: true,
      title: 'JazzCash',
      accountTitle: 'Rab Razi Restaurant',
      accountNumber: '0300-9998877',
      instructions: 'Transfer amount via JazzCash App or Retailer to 0300-9998877.'
    },
    easyPaisa: {
      enabled: true,
      title: 'EasyPaisa',
      accountTitle: 'Rab Razi Restaurant',
      accountNumber: '0300-9998877',
      instructions: 'Send money via EasyPaisa App to 0300-9998877.'
    },
    bankTransfer: {
      enabled: false,
      title: 'Bank Transfer',
      bankName: 'Meezan Bank Ltd',
      accountTitle: 'Rab Razi Restaurant',
      accountNumber: 'PK00MEZN0000123456789012',
      instructions: 'Transfer to Meezan Bank account and send receipt on WhatsApp.'
    }
  },
  socials: {
    facebook: 'https://facebook.com/rabrazirestaurant',
    instagram: 'https://instagram.com/rabrazirestaurant',
    tiktok: 'https://tiktok.com/@rabrazirestaurant'
  }
};

// Initial menu items
export const INITIAL_MENU = [
  {
    id: 'deal-1',
    name: 'Rab Razi Royal Feast (4-5 Persons)',
    category: 'deals',
    price: 3499,
    originalPrice: 4200,
    isDeal: true,
    discountPercentage: 17,
    description: '1 Full Shinwari Chicken Karahi, 1 Handi Mutton Tikka, 4 Garlic Naan, 1 Matka Biryani, 4 Cold Drinks (345ml), Special Mint Raita & Fresh Salad.',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    tags: ['Mega Bestseller', 'Family Special'],
    inStock: true,
    rating: 4.9,
    reviewsCount: 420,
    serves: '4-5 Persons',
    spicyLevel: 'Medium'
  },
  {
    id: 'deal-2',
    name: 'Duo Karahi & BBQ Feast (2 Persons)',
    category: 'deals',
    price: 1899,
    originalPrice: 2250,
    isDeal: true,
    discountPercentage: 15,
    description: 'Half Chicken Koyla Karahi, 1 Plate Chicken Malai Boti (4 pcs), 2 Roghni Naan, 2 Mint Margaritas, Raita & Salad.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    tags: ['Couple Deal', 'Trending'],
    inStock: true,
    rating: 4.8,
    reviewsCount: 235,
    serves: '2 Persons',
    spicyLevel: 'Medium'
  },
  {
    id: 'karahi-1',
    name: 'Rab Razi Signature Koyla Karahi',
    category: 'karahi',
    price: 1450,
    originalPrice: 1600,
    isDeal: false,
    description: 'Fresh chicken cooked in cast iron wok with secret aromatic garam masala, crushed black pepper, tomatoes, and infused with smoky charcoal aroma.',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80',
    tags: ['Chef Signature', 'Smoky'],
    inStock: true,
    rating: 5.0,
    reviewsCount: 310,
    spicyLevel: 'Hot',
    portionOptions: ['Half (0.5kg)', 'Full (1kg)']
  },
  {
    id: 'karahi-2',
    name: 'White Handi Chicken Makhni',
    category: 'karahi',
    price: 1550,
    originalPrice: 1700,
    isDeal: false,
    description: 'Tender boneless chicken cubes simmered gently in rich fresh cream, butter, green chilies, yogurt, and aromatic white pepper in a clay pot.',
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80',
    tags: ['Rich & Creamy', 'Mild Spicy'],
    inStock: true,
    rating: 4.9,
    reviewsCount: 180,
    spicyLevel: 'Mild',
    portionOptions: ['Half (0.5kg)', 'Full (1kg)']
  },
  {
    id: 'biryani-1',
    name: 'Rab Razi Special Matka Dum Biryani',
    category: 'biryani',
    price: 650,
    originalPrice: 750,
    isDeal: false,
    description: 'Long grain sela basmati rice steamed with marinated chicken pieces in sealed clay pot (matka), saffron, prunes, and fried golden onions.',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    tags: ['Clay Pot Dum', 'Fragrant'],
    inStock: true,
    rating: 4.9,
    reviewsCount: 512,
    spicyLevel: 'Medium'
  },
  {
    id: 'bbq-1',
    name: 'Royal Chicken Malai Boti Platter',
    category: 'bbq',
    price: 780,
    originalPrice: 850,
    isDeal: false,
    description: 'Melt-in-mouth boneless chicken thighs marinated for 12 hours in fresh malai, cashew paste, green cardamom, and char-grilled over natural coals.',
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
    tags: ['Charcoal Grilled', 'Tender'],
    inStock: true,
    rating: 4.9,
    reviewsCount: 290,
    spicyLevel: 'Mild'
  },
  {
    id: 'fastfood-1',
    name: 'Rab Razi Zinger Crunch Beast',
    category: 'fastfood',
    price: 520,
    originalPrice: 580,
    isDeal: false,
    description: 'Double whole-muscle chicken breast fillet with signature secret breading, melted cheddar cheese, iceberg lettuce, and spicy chipotle mayo on toasted brioche.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    tags: ['Ultra Crispy', 'Loaded'],
    inStock: true,
    rating: 4.8,
    reviewsCount: 340,
    spicyLevel: 'Medium'
  },
  {
    id: 'drinks-1',
    name: 'Chilled Mint Lemon Margarita',
    category: 'drinks',
    price: 250,
    originalPrice: 290,
    isDeal: false,
    description: 'Refreshing blend of fresh mint leaves, lemon juice, crushed ice, and black salt.',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
    tags: ['Super Refreshing'],
    inStock: true,
    rating: 4.9,
    reviewsCount: 260,
    spicyLevel: 'Beverage'
  }
];

// In-memory caches for instantaneous, failure-proof responses on serverless runtimes
let inMemoryUsers = [...INITIAL_USERS];
let inMemoryOrders = [];
let inMemorySettings = { ...INITIAL_SETTINGS };
let inMemoryMenu = [...INITIAL_MENU];

// Helper to ensure files exist safely without crashing on read-only environments
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

  try {
    if (!fs.existsSync(SETTINGS_FILE)) {
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(INITIAL_SETTINGS, null, 2), 'utf-8');
    } else {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      inMemorySettings = { ...INITIAL_SETTINGS, ...JSON.parse(data) };
    }
  } catch {
    // Read-only filesystem fallback
  }

  try {
    if (!fs.existsSync(MENU_FILE)) {
      fs.writeFileSync(MENU_FILE, JSON.stringify(INITIAL_MENU, null, 2), 'utf-8');
    } else {
      const data = fs.readFileSync(MENU_FILE, 'utf-8');
      const parsedMenu = JSON.parse(data);
      if (Array.isArray(parsedMenu) && parsedMenu.length > 0) {
        inMemoryMenu = parsedMenu;
      }
    }
  } catch {
    // Read-only filesystem fallback
  }
}

ensureFiles();

// Users
export function getUsers() {
  try {
    ensureFiles();
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      inMemoryUsers = JSON.parse(data);
    }
  } catch {
    // fallback to in-memory
  }
  return inMemoryUsers;
}

export function saveUsers(users) {
  inMemoryUsers = users;
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch {
    // in-memory persisted
  }
  return true;
}

// Orders
export function getOrders() {
  try {
    ensureFiles();
    if (fs.existsSync(ORDERS_FILE)) {
      const data = fs.readFileSync(ORDERS_FILE, 'utf-8');
      inMemoryOrders = JSON.parse(data);
    }
  } catch {
    // fallback to in-memory
  }
  return inMemoryOrders;
}

export function saveOrders(orders) {
  inMemoryOrders = orders;
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
  } catch {
    // in-memory persisted
  }
  return true;
}

// Settings
export function getSettings() {
  try {
    ensureFiles();
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      inMemorySettings = { ...INITIAL_SETTINGS, ...JSON.parse(data) };
    }
  } catch {
    // fallback to in-memory
  }
  return inMemorySettings;
}

export function saveSettings(newSettings) {
  inMemorySettings = {
    ...inMemorySettings,
    ...newSettings,
    paymentMethods: {
      ...inMemorySettings.paymentMethods,
      ...(newSettings.paymentMethods || {})
    }
  };
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(inMemorySettings, null, 2), 'utf-8');
  } catch {
    // in-memory persisted
  }
  return inMemorySettings;
}

// Menu Items
export function getMenuItems() {
  try {
    ensureFiles();
    if (fs.existsSync(MENU_FILE)) {
      const data = fs.readFileSync(MENU_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryMenu = parsed;
      }
    }
  } catch {
    // fallback to in-memory
  }
  return inMemoryMenu;
}

export function saveMenuItems(items) {
  inMemoryMenu = items;
  try {
    fs.writeFileSync(MENU_FILE, JSON.stringify(items, null, 2), 'utf-8');
  } catch {
    // in-memory persisted
  }
  return inMemoryMenu;
}
