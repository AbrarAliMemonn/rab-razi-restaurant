import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import BannerSection from './components/BannerSection';
import CategoryPills from './components/CategoryPills';
import FoodCard from './components/FoodCard';
import ItemDetailModal from './components/ItemDetailModal';
import CartDrawer from './components/CartDrawer';
import OrderTracking from './components/OrderTracking';
import AdminPanel from './components/AdminPanel';
import RiderPortal from './components/RiderPortal';
import DealsSection from './components/DealsSection';
import NotificationToast from './components/NotificationToast';
import { 
  Flame, 
  UtensilsCrossed, 
  ShoppingBag, 
  Phone, 
  MapPin, 
  Clock, 
  ChevronRight, 
  Sparkles,
  Wifi,
  ShieldCheck,
  Bike,
  ChefHat,
  X
} from 'lucide-react';

function MainLayout() {
  const {
    portalMode,
    switchToAdmin,
    switchToRider,
    switchToUser,
    currentTab,
    setCurrentTab,
    menuItems,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    isMobileFrameMode,
    setIsMobileFrameMode,
    settings,
    cartTotalCount,
    cartSubtotal,
    setIsCartOpen,
    orders,
    activeOrderId
  } = useApp();

  // Active tracked order for Customer live banner
  const [dismissedOrderId, setDismissedOrderId] = React.useState(null);
  const activeOrder = orders.find((o) => o.id === activeOrderId) || orders.find((o) => o.status === 'pending' || o.status === 'preparing' || o.status === 'on_the_way');
  const showOrderBanner = currentTab !== 'tracking' && activeOrder && activeOrder.id !== dismissedOrderId && (activeOrder.status === 'pending' || activeOrder.status === 'preparing' || activeOrder.status === 'on_the_way');

  // ==========================================================
  // 1. DEDICATED SEPARATE ADMIN PORTAL (#admin)
  // ==========================================================
  if (portalMode === 'admin') {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-amber-500 selection:text-black">
        {/* Dedicated Admin Header */}
        <header className="border-b border-zinc-800 bg-zinc-900/95 sticky top-0 z-40 backdrop-blur-md shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
            <div 
              onClick={switchToUser}
              className="flex items-center gap-2.5 cursor-pointer select-none group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center text-xl font-black text-white shadow-md">
                🍗
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-white text-base group-hover:text-amber-400 transition-colors">
                    Rab Razi Restaurant
                  </span>
                  <span className="bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                    Admin Portal
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 font-medium">Operations, Items Listing & Orders Queue</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={switchToRider}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 transition-all active:scale-95"
              >
                <Bike className="w-3.5 h-3.5" />
                <span>Rider GPS Mode</span>
              </button>

              <button
                onClick={switchToUser}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-md transition-all active:scale-95"
              >
                <span>Customer App</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* Admin Main Body */}
        <main className="max-w-7xl mx-auto px-3 sm:px-6 py-6">
          <AdminPanel />
        </main>

        <NotificationToast />
      </div>
    );
  }

  // ==========================================================
  // 2. DEDICATED SEPARATE RIDER GPS PORTAL (#rider)
  // ==========================================================
  if (portalMode === 'rider') {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-amber-500 selection:text-black">
        {/* Rider Top Navigation */}
        <header className="border-b border-zinc-800 bg-zinc-900/95 sticky top-0 z-40 backdrop-blur-md shadow-md">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
            <div 
              onClick={switchToUser}
              className="flex items-center gap-2.5 cursor-pointer select-none"
            >
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center text-lg font-black text-white shadow-md">
                🛵
              </div>
              <div>
                <span className="font-black text-white text-base">Rab Razi Rider GPS</span>
                <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Live Location Broadcaster</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={switchToAdmin}
                className="text-xs text-zinc-400 hover:text-white px-2 py-1"
              >
                Admin
              </button>
              <button
                onClick={switchToUser}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-all active:scale-95"
              >
                <span>Customer App</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* Rider Portal Body */}
        <main className="max-w-2xl mx-auto px-3 py-5">
          <RiderPortal />
        </main>

        <NotificationToast />
      </div>
    );
  }

  // ==========================================================
  // 3. DEDICATED SEPARATE CUSTOMER (USER) APP
  // ==========================================================

  // Filter items based on category and search
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all'
        ? true
        : selectedCategory === 'deals'
        ? item.isDeal
        : item.category === selectedCategory;

    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const featuredDeals = menuItems.filter((i) => i.isDeal);

  const renderContent = () => {
    switch (currentTab) {
      case 'tracking':
        return <OrderTracking />;

      case 'deals':
        return <DealsSection />;

      case 'menu':
        return (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white font-serif flex items-center gap-2">
                  <UtensilsCrossed className="w-5 h-5 text-amber-500" />
                  <span>Full Restaurant Menu</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Freshly cooked upon your order with traditional ingredients and secret spices.
                </p>
              </div>
              <span className="text-xs text-zinc-400 font-medium">
                {filteredItems.length} delicious options
              </span>
            </div>

            <CategoryPills />

            {/* Food Grid */}
            {filteredItems.length === 0 ? (
              <div className="text-center py-16 bg-zinc-900/50 rounded-3xl border border-zinc-800 text-zinc-400 space-y-2">
                <div className="text-3xl">🔍</div>
                <h3 className="font-bold text-white text-sm">No items found</h3>
                <p className="text-xs text-zinc-500">
                  Try searching with different keywords or switch category
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                  <FoodCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        );

      case 'home':
      default:
        return (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Banner Section */}
            <BannerSection />

            {/* Category Navigation Pills */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <span>Explore Menu Categories</span>
                </h3>
                <button
                  onClick={() => setCurrentTab('menu')}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  <span>See Full Menu</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <CategoryPills />
            </div>

            {/* Featured Deals Carousel Row */}
            {featuredDeals.length > 0 && selectedCategory === 'all' && !searchQuery && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-red-500/20 text-red-500 flex items-center justify-center">
                      <Flame className="w-4 h-4 fill-current" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-white font-serif">
                      Hot Family & Solo Deals
                    </h2>
                  </div>
                  <button
                    onClick={() => setCurrentTab('deals')}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <span>View All Deals</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {featuredDeals.slice(0, 4).map((item) => (
                    <FoodCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* Main Menu Grid */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🍲</span>
                  <h2 className="text-lg sm:text-xl font-black text-white font-serif">
                    {searchQuery
                      ? `Search Results for "${searchQuery}"`
                      : selectedCategory === 'all'
                      ? 'Popular Handi, Karahi, BBQ & Treats'
                      : 'Delicious Dishes'}
                  </h2>
                </div>
                <span className="text-xs text-zinc-400">
                  {filteredItems.length} items
                </span>
              </div>

              {filteredItems.length === 0 ? (
                <div className="text-center py-12 bg-zinc-900/50 rounded-3xl border border-zinc-800 text-zinc-400">
                  No dishes found. Try a different search term or category.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.map((item) => (
                    <FoodCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>

            {/* Why Rab Razi Restaurant Feature Badges */}
            <div className="pt-6 border-t border-zinc-800/80">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-xl flex-shrink-0">
                    🔥
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Pure Desi Ghee & Fresh Meat</h4>
                    <p className="text-[11px] text-zinc-400">Hand-picked fresh mutton, beef and chicken daily.</p>
                  </div>
                </div>

                <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl flex-shrink-0">
                    🛵
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Piping Hot 30-Min Delivery</h4>
                    <p className="text-[11px] text-zinc-400">Insulated thermal bags keep every meal boiling hot.</p>
                  </div>
                </div>

                <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-xl flex-shrink-0">
                    💯
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Live Kitchen Order Tracking</h4>
                    <p className="text-[11px] text-zinc-400">Track your meal live from wok to your doorstep.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  const appCore = (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 selection:bg-amber-500 selection:text-black">
      {/* Top Customer Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 py-5 pb-28 md:pb-16 space-y-4">
        {/* Real-Time Active Order Live Status Banner (Pending vs Preparing) */}
        {showOrderBanner && (
          <div className={`rounded-3xl p-4 sm:p-5 shadow-2xl border transition-all animate-in slide-in-from-top-3 duration-300 ${
            activeOrder.status === 'pending'
              ? 'bg-gradient-to-r from-amber-500/15 via-zinc-900 to-zinc-950 border-amber-500/40 text-amber-200'
              : activeOrder.status === 'preparing'
              ? 'bg-gradient-to-r from-orange-500/20 via-zinc-900 to-zinc-950 border-orange-500/50 text-orange-200 shadow-orange-950/20'
              : 'bg-gradient-to-r from-emerald-500/15 via-zinc-900 to-zinc-950 border-emerald-500/40 text-emerald-200 shadow-emerald-950/20'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-lg ${
                  activeOrder.status === 'pending'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                    : activeOrder.status === 'preparing'
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 animate-bounce'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}>
                  {activeOrder.status === 'pending' ? '⏳' : activeOrder.status === 'preparing' ? '🍳' : '🛵'}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black text-white font-mono bg-zinc-950/80 px-2 py-0.5 rounded-md border border-zinc-800">
                      Order #{activeOrder.id}
                    </span>
                    
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border flex items-center gap-1.5 ${
                      activeOrder.status === 'pending'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                        : activeOrder.status === 'preparing'
                        ? 'bg-orange-500/20 text-orange-300 border-orange-400/50'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50'
                    }`}>
                      {activeOrder.status === 'pending' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
                      {activeOrder.status === 'preparing' && <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping" />}
                      {activeOrder.status === 'on_the_way' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                      <span>
                        {activeOrder.status === 'pending'
                          ? 'Order Confirmed (Pending Approval - منظوری کا انتظار)'
                          : activeOrder.status === 'preparing'
                          ? 'Approved! Cooking in Kitchen (کچن میں تیار ہو رہا ہے)'
                          : 'Rider on the Road (رائیڈر روانہ ہے)'}
                      </span>
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                    {activeOrder.status === 'pending'
                      ? 'Aapka order Rab Razi Restaurant ko receive ho chuka hai. Admin ke approve karte hi kitchen me tayari shuru ho jayegi.'
                      : activeOrder.status === 'preparing'
                      ? 'Admin ne aapka order approve kar diya hai! Taaza masalay aur cuts karahi me pak rahay hain.'
                      : 'Rider aapka garma garam khana le kar rawana ho chuka hai.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => setCurrentTab('tracking')}
                  className={`px-4 py-2 rounded-xl text-xs font-black shadow-md transition-all active:scale-95 whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeOrder.status === 'pending'
                      ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950'
                      : activeOrder.status === 'preparing'
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 shadow-orange-950/40'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950'
                  }`}
                >
                  <span>{activeOrder.status === 'on_the_way' ? 'Watch Live GPS Map 📍' : 'Track Order ↗'}</span>
                </button>

                <button
                  onClick={() => setDismissedOrderId(activeOrder.id)}
                  className="p-1.5 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
                  title="Banner band karein"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {renderContent()}
      </main>

      {/* Desktop/Web Customer Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-800/80 pt-8 pb-20 md:pb-8 text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center text-lg">
              🍗
            </div>
            <div>
              <div className="font-extrabold text-white text-sm">
                Rab Razi Restaurant (رب راضی ریسٹورنٹ)
              </div>
              <div className="text-[11px] text-zinc-400">
                {settings.tagline} • Tando Bago, Sindh
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <a 
              href={`tel:${settings.phone.split('/')[0].trim()}`}
              className="flex items-center gap-1 text-zinc-300 hover:text-amber-400 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>{settings.phone}</span>
            </a>
            <span className="flex items-center gap-1 text-zinc-300">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{settings.openingHours}</span>
            </span>
            <a
              href={settings.googleMapsUrl || 'https://maps.app.goo.gl/j9TWCvYC6UaRACuf8'}
              target="_blank"
              rel="noreferrer"
              title="Open Rab Razi Restaurant on Google Maps"
              className="flex items-center gap-1 text-zinc-300 hover:text-amber-400 transition-colors bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>{settings.address}</span>
              <span className="text-amber-400 text-[10px] font-bold">↗</span>
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-500">
            <span>© {new Date().getFullYear()} Rab Razi Restaurant.</span>
            <span>•</span>
            
            {/* Rider Mode Link */}
            <button
              onClick={switchToRider}
              className="text-zinc-400 hover:text-amber-400 transition-colors flex items-center gap-1"
            >
              <Bike className="w-3.5 h-3.5 text-amber-400" />
              <span>Rider GPS Mode</span>
            </button>

            <span>•</span>

            {/* Admin Link */}
            <button
              onClick={switchToAdmin}
              className="text-zinc-400 hover:text-amber-400 transition-colors flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Staff / Admin Portal</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Checkout Bar for Mobile when cart has items */}
      {cartTotalCount > 0 && (
        <div className="fixed bottom-16 left-3 right-3 sm:hidden z-30 animate-in slide-in-from-bottom duration-200">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-zinc-950 font-black p-3.5 rounded-2xl shadow-2xl shadow-orange-950/60 flex items-center justify-between border border-amber-400/40"
          >
            <div className="flex items-center gap-2">
              <span className="bg-zinc-950 text-amber-400 text-xs px-2 py-0.5 rounded-lg font-black">
                {cartTotalCount}
              </span>
              <span className="text-xs font-black">View Basket & Checkout</span>
            </div>
            <span className="text-sm font-black bg-zinc-950/20 px-2.5 py-0.5 rounded-xl">
              Rs. {cartSubtotal.toLocaleString()}
            </span>
          </button>
        </div>
      )}

      {/* Mobile-first Customer Bottom Navigation Bar */}
      <BottomNav />

      {/* Global Modals & Notifications */}
      <ItemDetailModal />
      <CartDrawer />
      <NotificationToast />
    </div>
  );

  // If user enabled Phone Simulator Mode on desktop, wrap inside authentic mobile frame
  if (isMobileFrameMode) {
    return (
      <div className="min-h-screen bg-zinc-900 py-6 px-2 flex flex-col items-center justify-center">
        {/* Frame Toolbar */}
        <div className="mb-3 flex items-center gap-3 bg-zinc-950/90 border border-zinc-800 px-4 py-2 rounded-2xl text-xs text-zinc-300 shadow-xl">
          <span className="flex items-center gap-1.5 font-bold text-amber-400">
            <span>📱 Mobile App View Mode Active</span>
          </span>
          <span className="text-zinc-600">|</span>
          <button
            onClick={() => setIsMobileFrameMode(false)}
            className="text-zinc-400 hover:text-white underline font-semibold"
          >
            Switch to Fluid Fullscreen
          </button>
        </div>

        {/* Mobile Device Mockup Frame */}
        <div className="relative w-full max-w-[420px] h-[860px] max-h-[92vh] bg-black rounded-[48px] p-3 shadow-[0_0_60px_rgba(0,0,0,0.9)] border-[6px] border-zinc-800 ring-1 ring-zinc-700/50 flex flex-col overflow-hidden">
          {/* Top Notch / Dynamic Island */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-between px-3">
            <div className="w-2 h-2 rounded-full bg-zinc-900" />
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
          </div>

          {/* Fake Mobile Status Bar */}
          <div className="bg-zinc-950 text-zinc-400 text-[11px] font-bold px-6 py-2 flex items-center justify-between z-40 select-none">
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3 h-3" />
              <BatteryMedium className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Screen Container */}
          <div className="relative flex-1 rounded-[36px] overflow-y-auto no-scrollbar bg-zinc-950">
            {appCore}
          </div>

          {/* Mobile Bottom Home Bar Indicator */}
          <div className="h-4 bg-zinc-950 flex items-center justify-center pt-1">
            <div className="w-32 h-1 bg-zinc-600 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  // Normal responsive view
  return appCore;
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
