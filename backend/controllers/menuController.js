import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MENU_FILE = path.join(__dirname, '..', 'data', 'menu.json');

// Default initial menu items (Rab Razi Restaurant Tando Bago)
const INITIAL_MENU = [
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
  }
];

function ensureMenuFile() {
  if (!fs.existsSync(MENU_FILE)) {
    fs.writeFileSync(MENU_FILE, JSON.stringify(INITIAL_MENU, null, 2), 'utf-8');
  }
}

export function getMenuItems(req, res) {
  try {
    ensureMenuFile();
    const data = fs.readFileSync(MENU_FILE, 'utf-8');
    const items = JSON.parse(data);
    const { category, search } = req.query;

    let filtered = items;
    if (category && category !== 'all') {
      filtered = filtered.filter((i) => i.category === category || (category === 'deals' && i.isDeal));
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (i) => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
      );
    }

    return res.json({ success: true, count: filtered.length, items: filtered });
  } catch (error) {
    console.error('Get menu error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving menu items.' });
  }
}

export function getMenuItemById(req, res) {
  try {
    ensureMenuFile();
    const data = fs.readFileSync(MENU_FILE, 'utf-8');
    const items = JSON.parse(data);
    const item = items.find((i) => i.id === req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }

    return res.json({ success: true, item });
  } catch (error) {
    console.error('Get menu item by id error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving menu item.' });
  }
}
