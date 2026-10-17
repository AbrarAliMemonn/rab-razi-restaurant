import React from 'react';
import { 
  ShoppingBag, 
  MapPin, 
  Search, 
  Smartphone, 
  Monitor, 
  Clock, 
  Sparkles,
  User,
  Phone,
  MessageCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Header() {
  const {
    settings,
    cartTotalCount,
    setIsCartOpen,
    deliveryMode,
    setDeliveryMode,
    userLocation,
    setUserLocation,
    searchQuery,
    setSearchQuery,
    isMobileFrameMode,
    setIsMobileFrameMode,
    setCurrentTab,
    currentUser,
    setIsAuthModalOpen,
    setAuthModalTab,
    setIsProfileModalOpen
  } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 transition-all">
      {/* Top Announcement Bar */}
      {settings.announcement && (
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white text-xs py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2 overflow-hidden shadow-sm">
          <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-200" />
          <span className="truncate">{settings.announcement}</span>
          <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Code: {settings.promoCode}</span>
        </div>
      )}

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-3">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => setCurrentTab('home')} 
            className="flex items-center gap-2.5 cursor-pointer group select-none flex-shrink-0"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 flex items-center justify-center shadow-lg shadow-orange-950/40 text-xl font-black text-white group-hover:scale-105 transition-transform duration-200">
              🍗
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-extrabold text-white tracking-tight group-hover:text-amber-400 transition-colors">
                  Rab Razi
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold hidden xs:inline">
                  RESTAURANT
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-zinc-400 font-medium tracking-wide flex items-center gap-1 flex-wrap">
                <span className="hidden xs:inline">رب راضی ریسٹورنٹ</span>
                <span className="text-zinc-600 hidden xs:inline">•</span>
                <a
                  href={settings.googleMapsUrl || 'https://maps.app.goo.gl/j9TWCvYC6UaRACuf8'}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-amber-400/90 hover:text-amber-300 hover:underline flex items-center gap-0.5"
                  title="Google Maps location"
                >
                  <MapPin className="w-2.5 h-2.5" />
                  <span>Tando Bago 📍</span>
                </a>
                <span className="text-zinc-600">•</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Open
                </span>
              </p>
            </div>
          </div>

          {/* Center: Delivery / Pickup Toggle & Location (Desktop/Tablet) */}
          <div className="hidden md:flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 p-1 rounded-full text-xs">
            <button
              onClick={() => setDeliveryMode('delivery')}
              className={`px-3 py-1.5 rounded-full font-semibold transition-all ${
                deliveryMode === 'delivery'
                  ? 'bg-amber-500 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              🛵 Delivery
            </button>
            <button
              onClick={() => setDeliveryMode('pickup')}
              className={`px-3 py-1.5 rounded-full font-semibold transition-all ${
                deliveryMode === 'pickup'
                  ? 'bg-amber-500 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              🥡 Takeaway
            </button>
            
            <div className="h-4 w-px bg-zinc-700 mx-1" />

            <div className="flex items-center gap-1 text-zinc-300 pr-2">
              <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <input
                type="text"
                value={userLocation}
                onChange={(e) => setUserLocation(e.target.value)}
                className="bg-transparent text-xs text-zinc-200 outline-none w-36 truncate font-medium placeholder-zinc-500"
                placeholder="Enter delivery area"
                title="Delivery Location"
              />
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            
            {/* Quick Contact: Call & WhatsApp */}
            <a
              href={`https://wa.me/${settings.whatsappRaw || '923009998877'}?text=${encodeURIComponent('Assalam-o-Alaikum Rab Razi Restaurant! I would like to check your menu and specials.')}`}
              target="_blank"
              rel="noreferrer"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/50 transition-all shadow-sm active:scale-95"
              title="Chat on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp</span>
            </a>

            <a
              href={`tel:${(settings.phone || '0300-9998877').replace(/[^0-9+]/g, '')}`}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-all shadow-sm active:scale-95"
              title="Call Rab Razi Restaurant"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>{settings.phone || '0300-9998877'}</span>
            </a>

            {/* View Mode Switcher: Mobile Frame Mockup vs Wide Responsive */}
            <button
              onClick={() => setIsMobileFrameMode(!isMobileFrameMode)}
              title={isMobileFrameMode ? "Switch to Wide Responsive Screen" : "Preview Mobile App Frame Layout"}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                isMobileFrameMode
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
            >
              {isMobileFrameMode ? (
                <>
                  <Monitor className="w-3.5 h-3.5 text-amber-400" />
                  <span>Fluid View</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                  <span>App Frame</span>
                </>
              )}
            </button>

            {/* Foodpanda-style User Account Button / Profile Chip */}
            {currentUser ? (
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold bg-zinc-900 border border-amber-500/40 text-amber-300 hover:border-amber-400 transition-all shadow-sm active:scale-95 cursor-pointer"
                title="View My Account & Saved Addresses"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 font-black text-[10px] flex items-center justify-center">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : '👤'}
                </div>
                <span className="hidden xs:inline truncate max-w-[85px]">{(currentUser.name || 'User').split(' ')[0]}</span>
              </button>
            ) : (
              <button
                onClick={() => { setAuthModalTab('login'); setIsAuthModalOpen(true); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-zinc-800 hover:border-amber-500/40 transition-all shadow-sm active:scale-95 cursor-pointer"
                title="Log In or Create Foodpanda-style Account"
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Sign In</span>
              </button>
            )}

            {/* Cart Button with Live Counter Badge */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-bold px-3.5 py-2 rounded-2xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
            >
              <ShoppingBag className="w-4 h-4 text-zinc-950 stroke-[2.5]" />
              <span className="text-xs font-extrabold hidden xs:inline">Cart</span>
              {cartTotalCount > 0 && (
                <span className="bg-zinc-950 text-amber-400 text-[11px] font-black px-1.5 py-0.2 rounded-full min-w-[20px] text-center border border-amber-400/30">
                  {cartTotalCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search & Sub-header on small screens */}
        <div className="mt-2.5 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Karahi, BBQ, Biryani, Zinger, Deals..."
              className="w-full bg-zinc-900 border border-zinc-800/80 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/30 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs bg-zinc-800 rounded-full w-4 h-4 flex items-center justify-center"
              >
                ×
              </button>
            )}
          </div>

          {/* Quick Mobile Location Pill */}
          <div className="md:hidden flex items-center gap-1 bg-zinc-900 border border-zinc-800 px-2.5 py-2 rounded-xl text-xs text-zinc-300 max-w-[125px]">
            <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span className="truncate text-[11px] font-medium">{userLocation}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
