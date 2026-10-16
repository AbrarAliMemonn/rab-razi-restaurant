import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Edit3, 
  DollarSign, 
  ShoppingBag, 
  MapPin,
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Settings, 
  Utensils, 
  X, 
  Save, 
  Bike, 
  Eye, 
  Flame, 
  ArrowRight, 
  LogOut, 
  ExternalLink, 
  Phone, 
  Users, 
  ChefHat, 
  Store, 
  Tag, 
  Truck,
  ArrowLeft,
  MessageCircle,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Filter,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DEFAULT_CATEGORIES } from '../data/mockData';

export default function AdminPanel() {
  const {
    menuItems,
    orders,
    riders,
    addRider,
    updateRider,
    deleteRider,
    toggleRiderStatus,
    assignRiderToOrder,
    settings,
    updateOrderStatus,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleItemStock,
    updateSettings,
    showToast,
    setCurrentTab,
    setActiveOrderId,
    switchToUser,
    switchToRider,
    isAdminAuthenticated,
    loginAdmin,
    logoutAdmin
  } = useApp();

  // Admin login credentials state
  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('admin123');

  // Navigation tab in Admin
  const [activeAdminTab, setActiveAdminTab] = useState('orders'); // 'orders' | 'riders' | 'items' | 'settings'
  const [orderFilter, setOrderFilter] = useState('all');
  const [itemSearch, setItemSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Add/Edit menu item modal state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Add/Edit Rider modal state
  const [isRiderModalOpen, setIsRiderModalOpen] = useState(false);
  const [editingRider, setEditingRider] = useState(null);

  // Form state for add/edit item
  const [formData, setFormData] = useState({
    name: '',
    category: 'karahi',
    price: '',
    originalPrice: '',
    isDeal: false,
    discountBadge: '',
    description: '',
    image: '',
    tags: '',
    spicyLevel: 'Medium'
  });

  // Form state for add/edit rider
  const [riderFormData, setRiderFormData] = useState({
    name: '',
    phone: '',
    bike: '',
    status: 'available'
  });

  // Settings local state
  const [settingsForm, setSettingsForm] = useState({ ...settings });

  // Preset image suggestions for Pakistani restaurant dishes
  const presetImages = [
    { label: '🍲 Karahi', url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80' },
    { label: '🍢 BBQ Tikka', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80' },
    { label: '🍚 Dum Biryani', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80' },
    { label: '🍔 Zinger Burger', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80' },
    { label: '🫓 Roghni Naan', url: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80' },
    { label: '🍧 Shahi Kheer', url: 'https://images.unsplash.com/photo-1579954115563-e72bf1381629?auto=format&fit=crop&w=800&q=80' }
  ];

  // Stats calculation
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;
  const preparingOrdersCount = orders.filter((o) => o.status === 'preparing').length;
  const onTheWayOrdersCount = orders.filter((o) => o.status === 'on_the_way').length;
  const deliveredOrdersCount = orders.filter((o) => o.status === 'delivered').length;
  const activeOrdersCount = pendingOrdersCount + preparingOrdersCount + onTheWayOrdersCount;

  const availableRidersCount = riders.filter((r) => r.status === 'available').length;
  const onDeliveryRidersCount = riders.filter((r) => r.status === 'on_delivery').length;

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'all') return true;
    return o.status === orderFilter;
  });

  // Filtered menu items
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
      item.description.toLowerCase().includes(itemSearch.toLowerCase());
    const matchesCategory =
      selectedCategoryFilter === 'all'
        ? true
        : selectedCategoryFilter === 'deals'
        ? item.isDeal
        : item.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Item Modal Handlers
  const openAddItemModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'karahi',
      price: '',
      originalPrice: '',
      isDeal: false,
      discountBadge: '',
      description: '',
      image: presetImages[0].url,
      tags: 'Chef Special',
      spicyLevel: 'Medium'
    });
    setIsItemModalOpen(true);
  };

  const openEditItemModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price,
      originalPrice: item.originalPrice || '',
      isDeal: !!item.isDeal,
      discountBadge: item.discountBadge || '',
      description: item.description,
      image: item.image,
      tags: item.tags?.join(', ') || '',
      spicyLevel: item.spicyLevel || 'Medium'
    });
    setIsItemModalOpen(true);
  };

  const handleSaveItem = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      showToast('Dish ka naam aur qeemat darj karein', 'warning');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
      isDeal: Boolean(formData.isDeal),
      discountBadge: formData.discountBadge.trim() || (formData.isDeal ? 'DEAL' : ''),
      description: formData.description.trim(),
      image: formData.image || presetImages[0].url,
      tags: formData.tags
        ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
      spicyLevel: formData.spicyLevel
    };

    if (editingItem) {
      updateMenuItem({ ...editingItem, ...payload });
      showToast(`"${payload.name}" kamyabi se update ho gaya! ✅`);
    } else {
      addMenuItem(payload);
    }

    setIsItemModalOpen(false);
  };

  // Rider Modal Handlers
  const openAddRiderModal = () => {
    setEditingRider(null);
    setRiderFormData({
      name: '',
      phone: '',
      bike: 'Honda CG 125',
      status: 'available'
    });
    setIsRiderModalOpen(true);
  };

  const openEditRiderModal = (rider) => {
    setEditingRider(rider);
    setRiderFormData({
      name: rider.name,
      phone: rider.phone,
      bike: rider.bike,
      status: rider.status
    });
    setIsRiderModalOpen(true);
  };

  const handleSaveRider = (e) => {
    e.preventDefault();
    if (!riderFormData.name.trim() || !riderFormData.phone.trim()) {
      showToast('Rider ka naam aur mobile number zaroori hai', 'warning');
      return;
    }

    if (editingRider) {
      updateRider({
        ...editingRider,
        name: riderFormData.name.trim(),
        phone: riderFormData.phone.trim(),
        bike: riderFormData.bike.trim() || 'Honda CG 125',
        status: riderFormData.status
      });
      showToast(`Rider "${riderFormData.name}" update ho gaya! ✅`);
    } else {
      addRider({
        name: riderFormData.name.trim(),
        phone: riderFormData.phone.trim(),
        bike: riderFormData.bike.trim() || 'Honda CG 125',
        status: riderFormData.status
      });
    }

    setIsRiderModalOpen(false);
  };

  // Save Restaurant Settings
  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateSettings({
      ...settingsForm,
      deliveryFee: Number(settingsForm.deliveryFee),
      freeDeliveryThreshold: Number(settingsForm.freeDeliveryThreshold),
      promoDiscountPercent: Number(settingsForm.promoDiscountPercent)
    });
    showToast('Restaurant settings kamyabi se save ho gayin! ✅', 'success');
  };

  // Toggle Restaurant Open / Close
  const toggleStoreStatus = () => {
    const nextIsOpen = !settingsForm.isOpen;
    setSettingsForm((prev) => ({ ...prev, isOpen: nextIsOpen }));
    updateSettings({ ...settingsForm, isOpen: nextIsOpen });
    showToast(
      nextIsOpen
        ? 'Dukaan khol di gayi hai! (Orders Open) 🟢'
        : 'Dukaan band kar di gayi hai (Orders Paused) 🔴',
      nextIsOpen ? 'success' : 'info'
    );
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    loginAdmin(loginUsername, loginPassword);
  };

  // Quick WhatsApp Link Helper
  const openWhatsApp = (phone, text) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const intlPhone = cleanPhone.startsWith('0') ? '92' + cleanPhone.substring(1) : cleanPhone;
    window.open(`https://wa.me/${intlPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // =========================================================================
  // LOGIN SCREEN (Agar Login Na Ho)
  // =========================================================================
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto text-3xl shadow-xl shadow-orange-950/50">
              🛡️
            </div>
            <h2 className="text-2xl font-black text-white font-serif">Rab Razi Admin Login</h2>
            <p className="text-xs text-zinc-400">
              Restaurant Manager & Operations Portal
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">Admin Email / Username</label>
              <input
                type="text"
                required
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="abraralimemon23@gmail.com"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-black py-3.5 rounded-2xl text-xs shadow-lg shadow-orange-950/40 transition-all active:scale-[0.98] cursor-pointer"
            >
              Log In to Admin Dashboard
            </button>
          </form>

          <div className="pt-2 border-t border-zinc-800/80 flex flex-col gap-2">
            <button
              type="button"
              onClick={switchToUser}
              className="w-full py-2 text-zinc-400 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Customer App</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN ADMIN DASHBOARD
  // =========================================================================
  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-20 animate-in fade-in duration-300">
      
      {/* 1. TOP HERO OPERATIONS BAR */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800/90 p-4 sm:p-5 rounded-3xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Restaurant Identity & Open/Close Switch */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-red-600 text-white flex items-center justify-center text-2xl shadow-lg shadow-orange-950/40 flex-shrink-0">
            🍗
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-white">
                {settings.restaurantName}
              </h1>
              
              {/* Big Interactive Store Switch */}
              <button
                type="button"
                onClick={toggleStoreStatus}
                className={`text-xs font-black px-3 py-1 rounded-full border transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 ${
                  settingsForm.isOpen
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
                    : 'bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30'
                }`}
                title="Dukaan kholne ya band karne ke liye click karein"
              >
                <span className={`w-2 h-2 rounded-full ${settingsForm.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                <span>{settingsForm.isOpen ? '🟢 Dukaan Khuli Hai' : '🔴 Dukaan Band Hai'}</span>
              </button>
            </div>
            
            <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1.5">
              <span>Admin Management Hub</span>
              <span className="text-zinc-600">•</span>
              <span className="text-amber-400/90 font-medium">{settings.phone}</span>
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Add Buttons */}
          <button
            onClick={openAddItemModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-md transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Nayi Dish Add Karein</span>
          </button>

          <button
            onClick={openAddRiderModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 transition-all active:scale-95"
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Naya Rider Add Karein</span>
          </button>

          {/* Switch to Rider Portal */}
          <button
            onClick={switchToRider}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-amber-500/30 transition-all active:scale-95"
            title="Rider GPS live tracking app open karein"
          >
            <Bike className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Rider GPS App</span>
          </button>

          {/* Switch to Customer App */}
          <button
            onClick={switchToUser}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/80 transition-all active:scale-95"
            title="Customer app preview dekhein"
          >
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Customer App</span>
          </button>

          {/* Logout */}
          <button
            onClick={logoutAdmin}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-red-950/60 text-zinc-400 hover:text-red-400 border border-zinc-800 transition-all active:scale-95"
            title="Admin session khatam karein"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. STATS OVERVIEW CARDS (Big, Clean, Informative) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Revenue */}
        <div className="bg-zinc-900/90 border border-zinc-800/80 p-4 rounded-3xl space-y-1 hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Kul Kamayi (Revenue)
            </span>
            <div className="w-7 h-7 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
            Rs. {totalRevenue.toLocaleString()}
          </div>
          <span className="text-[10px] text-zinc-500 block">Deliver hue orders se</span>
        </div>

        {/* Active Live Orders */}
        <div 
          onClick={() => { setActiveAdminTab('orders'); setOrderFilter('all'); }}
          className="bg-zinc-900/90 border border-zinc-800/80 p-4 rounded-3xl space-y-1 hover:border-orange-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 group-hover:text-orange-400">
              Active Orders
            </span>
            <div className="w-7 h-7 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-orange-400 font-mono">
            {activeOrdersCount} Orders
          </div>
          <span className="text-[10px] text-zinc-500 block">
            {pendingOrdersCount} naye, {preparingOrdersCount} cooking, {onTheWayOrdersCount} on road
          </span>
        </div>

        {/* Riders Fleet */}
        <div 
          onClick={() => setActiveAdminTab('riders')}
          className="bg-zinc-900/90 border border-zinc-800/80 p-4 rounded-3xl space-y-1 hover:border-emerald-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 group-hover:text-emerald-400">
              Delivery Riders
            </span>
            <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Bike className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
            {riders.length} Riders
          </div>
          <span className="text-[10px] text-zinc-500 block">
            {availableRidersCount} available, {onDeliveryRidersCount} deliver kar rahe hain
          </span>
        </div>

        {/* Menu Items */}
        <div 
          onClick={() => setActiveAdminTab('items')}
          className="bg-zinc-900/90 border border-zinc-800/80 p-4 rounded-3xl space-y-1 hover:border-blue-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 group-hover:text-blue-400">
              Menu Dishes & Deals
            </span>
            <div className="w-7 h-7 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-zinc-100 font-mono">
            {menuItems.length} Dishes
          </div>
          <span className="text-[10px] text-zinc-500 block">
            {menuItems.filter((i) => i.isDeal).length} deals active hain
          </span>
        </div>
      </div>

      {/* 3. USER-FRIENDLY TABS WITH EMOJIS & BADGES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-zinc-900/80 p-1.5 rounded-2xl border border-zinc-800">
        {[
          { id: 'orders', label: 'Live Orders', urdu: 'گاہکوں کے آرڈرز', icon: '📋', count: orders.length, activeBadge: pendingOrdersCount > 0 ? `${pendingOrdersCount} New` : null },
          { id: 'riders', label: 'Delivery Riders', urdu: 'رائیڈرز اور بائیک', icon: '🛵', count: riders.length },
          { id: 'items', label: 'Menu & Deals', urdu: 'کھانے اور ڈیلز', icon: '🍽️', count: menuItems.length },
          { id: 'settings', label: 'Store Settings', urdu: 'دکان کی سیٹنگز', icon: '⚙️' }
        ].map((tab) => {
          const isActive = activeAdminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id)}
              className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-xl transition-all relative cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-zinc-950 font-black shadow-md scale-[1.02]'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-base">{tab.icon}</span>
                <span className="text-xs font-black">{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${isActive ? 'bg-zinc-950/20 text-zinc-950' : 'bg-zinc-800 text-zinc-400'}`}>
                    {tab.count}
                  </span>
                )}
              </div>
              <span className={`text-[9px] mt-0.5 ${isActive ? 'text-zinc-950/80 font-bold' : 'text-zinc-500'}`}>
                {tab.urdu}
              </span>

              {/* Alert notification bubble on tab */}
              {tab.activeBadge && !isActive && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-black px-1.5 rounded-full animate-pulse shadow">
                  {tab.activeBadge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: LIVE ORDERS QUEUE (Super Intuitive Step-by-Step) */}
      {/* ===================================================================== */}
      {activeAdminTab === 'orders' && (
        <div className="space-y-4">
          
          {/* Friendly Filters Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'All Orders (تمام)', count: orders.length, color: 'zinc' },
                { id: 'pending', label: '⏳ Naye Orders (Pending)', count: pendingOrdersCount, color: 'blue' },
                { id: 'preparing', label: '🍳 Kitchen Cooking', count: preparingOrdersCount, color: 'orange' },
                { id: 'on_the_way', label: '🛵 On The Road', count: onTheWayOrdersCount, color: 'amber' },
                { id: 'delivered', label: '✓ Delivered', count: deliveredOrdersCount, color: 'emerald' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setOrderFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    orderFilter === f.id
                      ? 'bg-amber-500 text-zinc-950 font-black shadow-md'
                      : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-white'
                  }`}
                >
                  <span>{f.label}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${orderFilter === f.id ? 'bg-zinc-950/20 text-zinc-950' : 'bg-zinc-800 text-zinc-400'}`}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>

            <span className="text-xs text-zinc-400 font-medium whitespace-nowrap">
              Showing {filteredOrders.length} orders
            </span>
          </div>

          {/* Orders Cards List */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16 bg-zinc-900/40 rounded-3xl border border-zinc-800 text-zinc-400 space-y-2">
              <div className="text-4xl">📋</div>
              <h3 className="font-bold text-white text-sm">Is Filter Me Koi Order Nahi Hai</h3>
              <p className="text-xs text-zinc-500">
                Customer jab naya order place karega to yahan foran live popup nazar aayega.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => {
                const isPending = order.status === 'pending';
                const isPreparing = order.status === 'preparing';
                const isOnTheWay = order.status === 'on_the_way';
                const isDelivered = order.status === 'delivered';

                return (
                  <div
                    key={order.id}
                    className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-5 space-y-4 hover:border-zinc-700 transition-all shadow-xl"
                  >
                    {/* Top Row: Order ID, Type, Badges */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800/80">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-black text-amber-400 font-mono">
                          #{order.id}
                        </span>

                        {/* Status Badge */}
                        <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                          isDelivered
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : isOnTheWay
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                            : isPreparing
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30 font-black'
                        }`}>
                          {isPending ? '🔔 Naya Order (Pending)' : isPreparing ? '🍳 Kitchen Cooking' : isOnTheWay ? '🛵 On The Road' : '✓ Delivered'}
                        </span>

                        <span className="text-xs text-zinc-400">
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>

                        <span className="bg-zinc-800 text-zinc-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {order.deliveryType}
                        </span>
                      </div>

                      {/* Total Amount & Track Preview */}
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-xs text-zinc-400 block font-medium">Kul Raqam (Total):</span>
                          <span className="text-base font-black text-amber-400 font-mono">
                            Rs. {order.total?.toLocaleString()}
                          </span>
                        </div>

                        {/* Track View */}
                        <button
                          onClick={() => {
                            setActiveOrderId(order.id);
                            switchToUser();
                            setCurrentTab('tracking');
                          }}
                          className="text-xs text-amber-400 hover:text-amber-300 font-bold px-3 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center gap-1.5 transition-all shadow-sm"
                          title="Customer view me is order ka live tracking map dekhein"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Track Map</span>
                        </button>
                      </div>
                    </div>

                    {/* Middle Details: Customer Info + Ordered Items */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {/* Customer Details with Direct Call & WhatsApp */}
                      <div className="space-y-2 bg-zinc-950/80 p-3.5 rounded-2xl border border-zinc-800/80">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-white text-sm">
                            {order.customerName}
                          </span>
                          <span className="text-[11px] font-bold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-md">
                            {order.paymentMethod}
                          </span>
                        </div>

                        <p className="text-zinc-300 leading-relaxed font-normal">
                          📍 {order.customerAddress}
                        </p>

                        {order.notes && (
                          <div className="text-amber-300/90 italic text-[11px] bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
                            <strong>Special Request:</strong> "{order.notes}"
                          </div>
                        )}

                        {/* Direct Call & WhatsApp Actions for Admin */}
                        <div className="flex items-center gap-2 pt-1">
                          <a
                            href={`tel:${order.customerPhone}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-bold text-xs transition-all"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Call: {order.customerPhone}</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => openWhatsApp(order.customerPhone, `Assalam-o-Alaikum ${order.customerName}! Rab Razi Restaurant se aapka order #${order.id} receive ho gaya hai.`)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 text-xs font-semibold"
                            title="Customer ko WhatsApp karein"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </button>
                        </div>
                      </div>

                      {/* Items Ordered */}
                      <div className="space-y-2 bg-zinc-950/80 p-3.5 rounded-2xl border border-zinc-800/80">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                          Ordered Items ({order.items.length}):
                        </span>

                        <div className="space-y-1.5 max-h-32 overflow-y-auto no-scrollbar">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between items-center text-zinc-300 py-0.5 border-b border-zinc-800/40 last:border-0">
                              <div>
                                <span className="font-extrabold text-amber-400 mr-1.5">{it.quantity}x</span>
                                <span className="font-semibold text-white">{it.name}</span>
                                {it.portion && (
                                  <span className="text-[10px] text-zinc-400 ml-1.5 bg-zinc-800 px-1.5 py-0.2 rounded">
                                    {it.portion}
                                  </span>
                                )}
                              </div>
                              <span className="font-mono text-zinc-300 font-bold">
                                Rs. {(it.price * it.quantity).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Rider Assignment & 1-Click Status Progression */}
                    <div className="pt-3 border-t border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
                      
                      {/* Rider Dropdown Selector */}
                      <div className="flex items-center gap-2 w-full md:w-auto">
                        <Bike className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <span className="text-zinc-400 font-bold whitespace-nowrap">Assigned Rider:</span>
                        <select
                          value={riders.find((r) => r.name === order.riderName)?.id || ''}
                          onChange={(e) => {
                            if (e.target.value) {
                              assignRiderToOrder(order.id, e.target.value);
                            }
                          }}
                          className="bg-zinc-950 border border-zinc-700 text-white rounded-xl px-3 py-1.5 text-xs outline-none focus:border-amber-500 font-semibold max-w-[220px]"
                        >
                          <option value="">{order.riderName || 'Choose Delivery Rider...'}</option>
                          {riders.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name} ({r.status === 'available' ? 'Available' : r.status === 'on_delivery' ? 'On Road' : 'Off Duty'})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Primary Next Action Button + Quick Status Buttons */}
                      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                        {/* Big recommended next step button based on current status */}
                        {isPending && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'preparing')}
                            className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-500 via-amber-500 to-orange-500 hover:from-emerald-400 hover:to-orange-400 text-zinc-950 shadow-lg shadow-orange-950/40 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Approve & Send to Kitchen (منظور کریں 🍳)</span>
                          </button>
                        )}

                        {isPreparing && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'on_the_way')}
                            className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 shadow-lg shadow-amber-950/40 transition-all active:scale-95 flex items-center gap-1.5"
                          >
                            <span>Dispatch Rider (رائیڈر روانہ کریں) 🛵</span>
                          </button>
                        )}

                        {isOnTheWay && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'delivered')}
                            className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white shadow-lg shadow-emerald-950/40 transition-all active:scale-95 flex items-center gap-1.5"
                          >
                            <span>Mark as Delivered (مکمل ہو گیا) ✓</span>
                          </button>
                        )}

                        {isDelivered && (
                          <span className="text-emerald-400 font-extrabold text-xs flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Order Successfully Delivered</span>
                          </span>
                        )}

                        {/* Dropdown / Extra options */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateOrderStatus(order.id, 'pending')}
                            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold ${isPending ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
                            title="Reset to Pending"
                          >
                            Pending
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order.id, 'cancelled')}
                            className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-zinc-800 text-zinc-400 hover:text-red-400"
                            title="Cancel Order"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: DELIVERY RIDERS FLEET (Super Friendly Rider Management) */}
      {/* ===================================================================== */}
      {activeAdminTab === 'riders' && (
        <div className="space-y-4">
          
          {/* Header Action Banner */}
          <div className="bg-zinc-900 p-4 sm:p-5 rounded-3xl border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Bike className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-white">Riders & Delivery Fleet (ڈیلیوری بوائز)</h3>
              </div>
              <p className="text-xs text-zinc-400">
                Naye delivery riders shamil karein, unki bike plate note karein aur duty manage karein.
              </p>
            </div>

            <button
              onClick={openAddRiderModal}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-black px-4 py-2.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-950/30 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Naya Rider Shamil Karein</span>
            </button>
          </div>

          {/* Riders Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {riders.map((rider) => {
              const isAvailable = rider.status === 'available';
              const isOnDelivery = rider.status === 'on_delivery';

              return (
                <div
                  key={rider.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-5 space-y-4 hover:border-zinc-700 transition-all shadow-md flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Rider Avatar & Phone */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center text-xl font-black">
                          🛵
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-white">{rider.name}</h4>
                          <a
                            href={`tel:${rider.phone}`}
                            className="text-xs text-zinc-400 flex items-center gap-1 font-mono hover:text-amber-400 mt-0.5"
                          >
                            <Phone className="w-3 h-3 text-amber-500" />
                            <span>{rider.phone}</span>
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Bike Details & Stats */}
                    <div className="bg-zinc-950/80 p-3.5 rounded-2xl border border-zinc-800/80 space-y-1.5 text-xs">
                      <div className="flex justify-between text-zinc-400">
                        <span>Vehicle / Bike:</span>
                        <strong className="text-white font-semibold">{rider.bike}</strong>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Kul Deliveries:</span>
                        <strong className="text-amber-400 font-bold">{rider.totalDeliveries || 0} Orders</strong>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Rating:</span>
                        <strong className="text-amber-400">★ {rider.rating || 4.9}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Status Toggle & Edit/Delete Actions */}
                  <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                    
                    {/* 1-Click Duty Switch */}
                    <button
                      onClick={() => toggleRiderStatus(rider.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all flex items-center gap-1.5 cursor-pointer ${
                        isOnDelivery
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                          : isAvailable
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
                      }`}
                      title="Duty switch karein"
                    >
                      <span className={`w-2 h-2 rounded-full ${isOnDelivery ? 'bg-amber-400 animate-ping' : isAvailable ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
                      <span>{isOnDelivery ? 'On Road (Deliver)' : isAvailable ? '🟢 On Duty (Available)' : '⚪ Off Duty (Chhutti)'}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {/* WhatsApp Rider Button */}
                      <button
                        onClick={() => openWhatsApp(rider.phone, `Assalam-o-Alaikum ${rider.name}! Rab Razi Restaurant management se delivery update.`)}
                        className="p-2 rounded-xl bg-zinc-800 hover:bg-emerald-950/60 text-zinc-300 hover:text-emerald-400 transition-all"
                        title="WhatsApp par rabta karein"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit Rider */}
                      <button
                        onClick={() => openEditRiderModal(rider)}
                        className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all"
                        title="Rider details edit karein"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Rider */}
                      <button
                        onClick={() => {
                          if (confirm(`Kiya aap waqai rider "${rider.name}" ko remove karna chahte hain?`)) {
                            deleteRider(rider.id);
                          }
                        }}
                        className="p-2 rounded-xl bg-zinc-800 hover:bg-red-950 text-zinc-400 hover:text-red-400 transition-all"
                        title="Rider ko delete karein"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: MENU & DEALS ITEMS MANAGEMENT (Simple, Visual, Touch-Friendly) */}
      {/* ===================================================================== */}
      {activeAdminTab === 'items' && (
        <div className="space-y-4">
          
          {/* Top Search & Add Button Bar */}
          <div className="bg-zinc-900 p-4 rounded-3xl border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={itemSearch}
                onChange={(e) => setItemSearch(e.target.value)}
                placeholder="Dish ya deal ka naam likhein..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              onClick={openAddItemModal}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-black px-4 py-2.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-950/30 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Nayi Dish / Deal Add Karein</span>
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {DEFAULT_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategoryFilter === cat.id
                    ? 'bg-amber-500 text-zinc-950 font-black shadow-md'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Dishes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredMenuItems.map((item) => (
              <div
                key={item.id}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 space-y-3 flex flex-col justify-between hover:border-zinc-700 transition-all shadow-md"
              >
                <div className="flex gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-2xl object-cover bg-zinc-800 flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      {item.isDeal && (
                        <span className="bg-red-600 text-white text-[9px] font-black px-1.5 rounded uppercase">
                          DEAL
                        </span>
                      )}
                      <span className="text-[10px] text-zinc-400 uppercase font-semibold">
                        {item.category}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs sm:text-sm text-white truncate mt-0.5">
                      {item.name}
                    </h4>

                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-sm font-black text-amber-400">
                        Rs. {item.price.toLocaleString()}
                      </span>
                      {item.originalPrice && (
                        <span className="text-[10px] text-zinc-500 line-through">
                          Rs. {item.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                {/* Stock Toggle & Edit/Delete Actions */}
                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => toggleItemStock(item.id)}
                    className={`px-3 py-1 rounded-xl text-[11px] font-black border transition-all cursor-pointer ${
                      item.inStock
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                        : 'bg-red-500/15 border-red-500/30 text-red-400 hover:bg-red-500/25'
                    }`}
                    title="Dish ko available ya out of stock karein"
                  >
                    {item.inStock ? '✓ Available (دستیاب)' : '✕ Khatam (Out of Stock)'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditItemModal(item)}
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all"
                      title="Dish details edit karein"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Kiya aap dish "${item.name}" ko menu se delete karna chahte hain?`)) {
                          deleteMenuItem(item.id);
                        }
                      }}
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-red-950 text-zinc-400 hover:text-red-400 transition-all"
                      title="Dish ko delete karein"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: STORE SETTINGS & TIMING (Clean, Beautiful, Organized, No Reset Button) */}
      {/* ===================================================================== */}
      {activeAdminTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-5 animate-in fade-in duration-200">
          
          {/* Card 1: Restaurant Profile & Timings */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-black text-white">Restaurant Profile & Timings (ریسٹورنٹ پروفائل)</h3>
                  <p className="text-[11px] text-zinc-400">Naam, pata, rabta aur dukaan khulne band hone ke auqaat</p>
                </div>
              </div>

              {/* Quick Status Button */}
              <button
                type="button"
                onClick={toggleStoreStatus}
                className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all flex items-center gap-1.5 cursor-pointer ${
                  settingsForm.isOpen
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                    : 'bg-red-500/20 border-red-500/40 text-red-400'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${settingsForm.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                <span>{settingsForm.isOpen ? 'Store is Open 🟢' : 'Store is Closed 🔴'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-zinc-300">Restaurant Name (ریسٹورنٹ کا نام)</label>
                <input
                  type="text"
                  required
                  value={settingsForm.restaurantName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, restaurantName: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-300">Tagline / Slogan (خوشخبری / نعرہ)</label>
                <input
                  type="text"
                  value={settingsForm.tagline}
                  onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-300">Contact Phone Numbers (رابطہ نمبرز)</label>
                <input
                  type="text"
                  required
                  value={settingsForm.phone}
                  onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-300">Opening Hours (اوقات کار)</label>
                <input
                  type="text"
                  value={settingsForm.openingHours}
                  onChange={(e) => setSettingsForm({ ...settingsForm, openingHours: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  placeholder="12:00 PM – 02:00 AM"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-bold text-zinc-300">Physical Address (مکمل پتہ)</label>
                <input
                  type="text"
                  value={settingsForm.address}
                  onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Google Maps Pin & Plus Code */}
              <div className="space-y-1 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-zinc-300 flex items-center gap-1.5">
                    <span>Google Maps Link (گوگل میپس لوکیشن لنک)</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-mono">
                      Plus Code: {settingsForm.plusCode || 'QXQ6+C96'}
                    </span>
                  </label>
                  {settingsForm.googleMapsUrl && (
                    <a
                      href={settingsForm.googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-amber-400 hover:underline text-[11px] font-bold flex items-center gap-1"
                    >
                      <span>Check on Google Maps ↗</span>
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={settingsForm.googleMapsUrl || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, googleMapsUrl: e.target.value })}
                    placeholder="https://maps.app.goo.gl/..."
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500 text-xs font-mono"
                  />
                  <a
                    href={settingsForm.googleMapsUrl || 'https://maps.app.goo.gl/j9TWCvYC6UaRACuf8'}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-bold rounded-xl text-xs flex items-center gap-1 border border-zinc-700 whitespace-nowrap active:scale-95 transition-all"
                  >
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>Open Map</span>
                  </a>
                </div>
                <p className="text-[10px] text-zinc-400">
                  📍 Coordinates: 24.7885° N, 68.9609° E (Tando Bago, Sindh)
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Delivery & Charges */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-lg">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
              <Truck className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-sm font-black text-white">Delivery Charges & Time Limit (ڈیلیوری چارجز)</h3>
                <p className="text-[11px] text-zinc-400">Rider delivery fees aur muft delivery limit</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-zinc-300">Standard Delivery Fee (Rs.)</label>
                <input
                  type="number"
                  value={settingsForm.deliveryFee}
                  onChange={(e) => setSettingsForm({ ...settingsForm, deliveryFee: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-300">Free Delivery Limit (Rs.)</label>
                <input
                  type="number"
                  value={settingsForm.freeDeliveryThreshold}
                  onChange={(e) => setSettingsForm({ ...settingsForm, freeDeliveryThreshold: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-300">Estimated Delivery Time</label>
                <input
                  type="text"
                  value={settingsForm.estimatedDeliveryTime}
                  onChange={(e) => setSettingsForm({ ...settingsForm, estimatedDeliveryTime: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  placeholder="30-40 min"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Promo Codes & Announcement Banner */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-lg">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
              <Tag className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-sm font-black text-white">Discounts, Vouchers & Top Announcement (ڈسکاؤنٹ اور نوٹس)</h3>
                <p className="text-[11px] text-zinc-400">Discount coupon code aur customer app ka top notification banner</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-zinc-300">Active Promo Code (کوپن کوڈ)</label>
                <input
                  type="text"
                  value={settingsForm.promoCode}
                  onChange={(e) => setSettingsForm({ ...settingsForm, promoCode: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  placeholder="RAZI20"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-300">Discount Percentage (%)</label>
                <input
                  type="number"
                  value={settingsForm.promoDiscountPercent}
                  onChange={(e) => setSettingsForm({ ...settingsForm, promoDiscountPercent: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  placeholder="20"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-bold text-zinc-300">Top Announcement Banner (نوٹس بینر)</label>
                <input
                  type="text"
                  value={settingsForm.announcement}
                  onChange={(e) => setSettingsForm({ ...settingsForm, announcement: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  placeholder="🎉 Rab Razi Special: Flat 20% OFF using code RAZI20"
                />
              </div>
            </div>
          </div>

          {/* Clean Save Settings Action Bar */}
          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-black px-7 py-3.5 rounded-2xl text-xs flex items-center gap-2 shadow-xl shadow-orange-950/40 transition-all active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Restaurant Settings (تبدیلیاں محفوظ کریں)</span>
            </button>
          </div>

        </form>
      )}

      {/* ===================================================================== */}
      {/* MODAL: ADD / EDIT RIDER */}
      {/* ===================================================================== */}
      {isRiderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80">
              <div className="flex items-center gap-2">
                <Bike className="w-4 h-4 text-amber-400" />
                <h3 className="text-base font-black text-white">
                  {editingRider ? 'Edit Rider Profile' : 'Add New Delivery Rider (نیا رائیڈر)'}
                </h3>
              </div>
              <button
                onClick={() => setIsRiderModalOpen(false)}
                className="p-1.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRider} className="p-4 sm:p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-zinc-300">Rider Full Name (رائیڈر کا نام) *</label>
                <input
                  type="text"
                  required
                  value={riderFormData.name}
                  onChange={(e) => setRiderFormData({ ...riderFormData, name: e.target.value })}
                  placeholder="e.g. Farhan Tariq (Rider #14)"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-300">Mobile Phone Number (موبائل نمبر) *</label>
                <input
                  type="tel"
                  required
                  value={riderFormData.phone}
                  onChange={(e) => setRiderFormData({ ...riderFormData, phone: e.target.value })}
                  placeholder="0312-9876543"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-300">Bike Model & Number Plate (موٹرسائیکل نمبر)</label>
                <input
                  type="text"
                  value={riderFormData.bike}
                  onChange={(e) => setRiderFormData({ ...riderFormData, bike: e.target.value })}
                  placeholder="e.g. Honda CG 125 (ICT-992)"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-300">Duty Status (ڈیوٹی کا اسٹیٹس)</label>
                <select
                  value={riderFormData.status}
                  onChange={(e) => setRiderFormData({ ...riderFormData, status: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="available">🟢 Available (On Duty - تیار ہے)</option>
                  <option value="off_duty">⚪ Off Duty (چھٹی پر ہے)</option>
                  <option value="on_delivery">🛵 On Delivery (آرڈر ڈیلیور کر رہا ہے)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRiderModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black shadow-md cursor-pointer"
                >
                  {editingRider ? 'Save Changes' : 'Register Rider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: ADD / EDIT MENU ITEM */}
      {/* ===================================================================== */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80">
              <h3 className="text-base font-black text-white">
                {editingItem ? 'Edit Menu Dish / Deal' : 'Add New Dish to Menu (نیا کھانا شامل کریں)'}
              </h3>
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="p-1.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveItem} className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs no-scrollbar">
              
              <div className="space-y-1">
                <label className="font-bold text-zinc-300">Dish / Deal Name (کھانے کا نام) *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Special Chicken White Handi"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-300">Category (کیٹگری)</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  >
                    {DEFAULT_CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-300">Spice Level (مرچ کا لیول)</label>
                  <select
                    value={formData.spicyLevel}
                    onChange={(e) => setFormData({ ...formData, spicyLevel: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Mild">Mild (ہلکی مرچ)</option>
                    <option value="Medium">Medium (درمیانی)</option>
                    <option value="Spicy">Spicy (تیز)</option>
                    <option value="Hot">Hot (ایکسٹرا تیز)</option>
                    <option value="Sweet">Sweet (میٹھا)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-300">Price (قیمت Rs.) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="1200"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-300">Original Price (پرانی قیمت Rs.)</label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    placeholder="1500 (optional)"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Deal Checkbox */}
              <div className="flex items-center gap-2 bg-zinc-950 p-3 rounded-2xl border border-zinc-800">
                <input
                  type="checkbox"
                  id="isDealCheckbox"
                  checked={formData.isDeal}
                  onChange={(e) => setFormData({ ...formData, isDeal: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="isDealCheckbox" className="font-bold text-white cursor-pointer select-none">
                  Highlight as Special Deal / Combo (اسپیشل ڈیل بنائیں)
                </label>
              </div>

              {formData.isDeal && (
                <div className="space-y-1">
                  <label className="font-bold text-zinc-300">Discount Badge Text</label>
                  <input
                    type="text"
                    value={formData.discountBadge}
                    onChange={(e) => setFormData({ ...formData, discountBadge: e.target.value })}
                    placeholder="e.g. Save Rs. 500 or 25% OFF"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              {/* Image URL & Preset selector */}
              <div className="space-y-1.5">
                <label className="font-bold text-zinc-300">Food Image URL (تصویر کا لنک)</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />

                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                  <span className="text-[10px] text-zinc-500 whitespace-nowrap">تیار تصاویر:</span>
                  {presetImages.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, image: p.url })}
                      className="px-2 py-0.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] whitespace-nowrap"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-300">Tags (ٹیگز e.g. Chef Special, Must Try)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g. Chef Special, Best Seller"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-300">Description (تفصیل)</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="کھانے کی تفصیل لکھیں..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black shadow-md cursor-pointer"
                >
                  {editingItem ? 'Update Dish' : 'Add to Menu'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
