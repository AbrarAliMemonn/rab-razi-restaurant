import { getMenuItems as getStoredMenuItems, INITIAL_MENU } from '../data/db.js';
import MenuItem from '../models/MenuItem.js';

// GET /api/menu
export async function getMenuItems(req, res) {
  try {
    let items = [];

    // Attempt MongoDB fetch if database is connected
    try {
      if (MenuItem.db?.readyState === 1) {
        const mongoItems = await MenuItem.find().lean();
        if (Array.isArray(mongoItems) && mongoItems.length > 0) {
          items = mongoItems;
        }
      }
    } catch (dbErr) {
      // Non-blocking fallback to local store
    }

    // Fallback to robust stored menu in db.js (with INITIAL_MENU fallback)
    if (!items || items.length === 0) {
      items = getStoredMenuItems();
    }

    if (!items || items.length === 0) {
      items = INITIAL_MENU;
    }

    const { category, search } = req.query;
    let filtered = [...items];

    if (category && category !== 'all') {
      filtered = filtered.filter(
        (i) => i.category === category || (category === 'deals' && i.isDeal)
      );
    }

    if (search) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (i) =>
          (i.name && i.name.toLowerCase().includes(q)) ||
          (i.description && i.description.toLowerCase().includes(q)) ||
          (i.category && i.category.toLowerCase().includes(q))
      );
    }

    return res.json({
      success: true,
      count: filtered.length,
      items: filtered
    });
  } catch (error) {
    console.error('Get menu error:', error);
    // Graceful fallback to INITIAL_MENU in case of any runtime anomaly
    return res.json({
      success: true,
      count: INITIAL_MENU.length,
      items: INITIAL_MENU,
      fallback: true
    });
  }
}

// GET /api/menu/:id
export async function getMenuItemById(req, res) {
  try {
    const { id } = req.params;
    let items = [];

    try {
      if (MenuItem.db?.readyState === 1) {
        const mongoItem = await MenuItem.findOne({ $or: [{ itemId: id }, { id }] }).lean();
        if (mongoItem) {
          return res.json({ success: true, item: mongoItem });
        }
      }
    } catch {}

    items = getStoredMenuItems() || INITIAL_MENU;
    const item = items.find((i) => (i.id && i.id === id) || (i.itemId && i.itemId === id));

    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }

    return res.json({ success: true, item });
  } catch (error) {
    console.error('Get menu item by id error:', error);
    const item = INITIAL_MENU.find((i) => i.id === req.params.id);
    if (item) {
      return res.json({ success: true, item });
    }
    return res.status(500).json({ success: false, message: 'Server error retrieving menu item.' });
  }
}
