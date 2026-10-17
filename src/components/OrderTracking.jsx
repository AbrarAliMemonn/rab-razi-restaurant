import React, { useState, useEffect, useRef } from 'react';
import { 
  Bike, 
  Clock, 
  MapPin, 
  Phone, 
  CheckCircle, 
  ChefHat, 
  FileText, 
  Search, 
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Receipt,
  Navigation,
  Radio,
  Gauge,
  Compass,
  ExternalLink,
  Flame,
  AlertCircle,
  UtensilsCrossed
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function OrderTracking() {
  const { 
    orders, 
    activeOrderId, 
    setActiveOrderId, 
    setCurrentTab, 
    settings,
    updateOrderStatus,
    riderLiveLocation,
    setRiderLiveLocation,
    switchToRider,
    currentUser,
    showToast 
  } = useApp();

  const [lookupId, setLookupId] = useState('');

  // Safe settings fallback to prevent any undefined runtime crashes
  const safeSettings = settings || {
    restaurantName: 'Rab Razi Restaurant',
    address: 'Main Badin-Mirpurkhas Road, Tando Bago, Sindh',
    plusCode: 'QXQ6+C96',
    googleMapsUrl: 'https://maps.app.goo.gl/j9TWCvYC6UaRACuf8',
    phone: '0300-9998877'
  };

  // Filter orders strictly for the current logged-in user or active session
  const userOrders = orders.filter((o) => {
    if (currentUser) {
      return (
        (o.userId && o.userId === currentUser.id) ||
        (o.customerEmail && currentUser.email && o.customerEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
        (o.customerPhone && currentUser.phone && o.customerPhone === currentUser.phone) ||
        (activeOrderId && o.id === activeOrderId)
      );
    }
    return Boolean(activeOrderId && o.id === activeOrderId);
  });

  // Current selected order: either the searched/active order or latest user order
  const currentOrder =
    (activeOrderId && orders.find((o) => o.id === activeOrderId)) ||
    userOrders[0] ||
    null;

  const handleSearchOrder = (e) => {
    e.preventDefault();
    if (!lookupId.trim()) {
      showToast('Please enter an Order ID', 'warning');
      return;
    }
    const cleanId = lookupId.trim().toUpperCase().replace('#', '');
    const found = orders.find((o) => {
      const oid = o.id.toUpperCase();
      return oid === cleanId || oid === `RRR-${cleanId}` || oid.replace('RRR-', '') === cleanId;
    });

    if (found) {
      setActiveOrderId(found.id);
      showToast(`Showing Order #${found.id}`, 'success');
      setLookupId('');
    } else {
      showToast(`Order #${cleanId} not found. Please verify your Order ID`, 'warning');
    }
  };

  // Status mapping
  const steps = [
    {
      key: 'pending',
      title: 'Order Confirmed (Pending Approval)',
      description: 'Order received. Waiting for admin approval to start cooking in kitchen',
      icon: FileText
    },
    {
      key: 'preparing',
      title: 'Approved & Cooking in Kitchen',
      description: 'Admin approved! Fresh spices & cuts simmering on the stove',
      icon: ChefHat
    },
    {
      key: 'on_the_way',
      title: 'Out for Delivery (On Bike)',
      description: 'Rider is on bike heading to your house with piping hot food',
      icon: Bike
    },
    {
      key: 'delivered',
      title: 'Delivered Successfully',
      description: 'Enjoy your hot meal! Rab Razi Blessings',
      icon: CheckCircle
    }
  ];

  const getStepStatus = (stepKey, currentStatus) => {
    const statusOrder = ['pending', 'preparing', 'on_the_way', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepKey);

    if (currentStatus === 'cancelled') {
      return 'cancelled';
    }

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  // Compute animated coordinates on live map SVG
  const isRiderOnRoad = currentOrder?.status === 'on_the_way';

  const progressPercent = currentOrder?.status === 'delivered'
    ? 96
    : isRiderOnRoad
    ? (riderLiveLocation?.progress || 48)
    : currentOrder?.status === 'preparing'
    ? 18
    : 8;

  const riderLeftStyle = `${progressPercent}%`;
  // Sine curve y offset for curved road appearance
  const riderTopStyle = `${58 - Math.sin((progressPercent / 100) * Math.PI) * 36}%`;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Header and Order Search Bar */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/15 text-amber-400 font-bold">
                <Bike className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white">Live Order Tracking</h1>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Foodpanda-style Live GPS coordinates & kitchen dispatch stepper
            </p>
          </div>

          {/* Search by Order ID */}
          <form onSubmit={handleSearchOrder} className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={lookupId}
                onChange={(e) => setLookupId(e.target.value)}
                placeholder="Track ID e.g. RRR-7821"
                className="bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-zinc-500 w-full sm:w-44 focus:outline-none focus:border-amber-500"
              />
            </div>
            <button
              type="submit"
              className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 font-bold px-3.5 py-2 rounded-xl text-xs transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              Search
            </button>
          </form>
        </div>

        {/* Recent Orders Selector Pills */}
        {userOrders.length > 0 && (
          <div className="pt-2 border-t border-zinc-800/80">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
              Select Your Recent Orders:
            </span>
            <div className="flex flex-wrap gap-2">
              {userOrders.map((ord) => {
                const isSelected = currentOrder && currentOrder.id === ord.id;
                const statusColor =
                  ord.status === 'delivered'
                    ? 'text-emerald-400'
                    : ord.status === 'on_the_way'
                    ? 'text-amber-400'
                    : ord.status === 'preparing'
                    ? 'text-orange-400'
                    : 'text-yellow-400';

                return (
                  <button
                    key={ord.id}
                    onClick={() => setActiveOrderId(ord.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500/80 text-amber-400 shadow-md ring-1 ring-amber-500/30 font-bold'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    <span>#{ord.id}</span>
                    <span className={`text-[10px] uppercase font-bold ${statusColor}`}>
                      • {ord.status.replace('_', ' ')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {!currentOrder ? (
        <div className="text-center py-16 bg-zinc-900/50 rounded-3xl border border-zinc-800 space-y-3">
          <div className="text-4xl">🛵</div>
          <h3 className="text-lg font-bold text-zinc-200">No active orders found</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Place an order from our mouth-watering menu to watch live tracking in real time!
          </p>
          <button
            onClick={() => setCurrentTab('menu')}
            className="mt-3 px-5 py-2.5 bg-amber-500 text-zinc-950 text-xs font-black rounded-xl hover:bg-amber-400 shadow-md cursor-pointer transition-all active:scale-95"
          >
            Explore Menu & Deals
          </button>
        </div>
      ) : (
        <>
          {/* Main Status Hero Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-2xl">
            
            {/* Top Bar with Order Number & Time */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
                    Order ID:
                  </span>
                  <span className="text-lg font-black text-amber-400 font-mono">
                    #{currentOrder.id}
                  </span>
                  <span className="bg-zinc-800 text-zinc-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {currentOrder.deliveryType || 'Delivery'}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Placed at: {new Date(currentOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {/* ETA Display with Live GPS Ping */}
              <div className="bg-zinc-950/80 border border-zinc-800 px-4 py-2.5 rounded-2xl flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-400 animate-pulse flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-zinc-400 block font-semibold uppercase tracking-wider flex items-center gap-1">
                    <span>Estimated Status</span>
                    {currentOrder.status === 'on_the_way' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    )}
                  </span>
                  <span className="text-sm font-black text-white">
                    {currentOrder.status === 'delivered'
                      ? 'Delivered with Love 🎉'
                      : currentOrder.status === 'on_the_way'
                      ? `${riderLiveLocation?.distanceRemaining || '1.1 km'} away (~${riderLiveLocation?.etaMinutes || 4} mins)`
                      : currentOrder.status === 'preparing'
                      ? 'Approved & Cooking in Kitchen 🍳 (~20-25 mins)'
                      : 'Order Confirmed • Pending Admin Approval ⏳'}
                  </span>
                </div>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="pt-6 pb-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-2">
                {steps.map((st) => {
                  const Icon = st.icon;
                  const stepState = getStepStatus(st.key, currentOrder.status);
                  const isDone = stepState === 'completed';
                  const isCurrent = stepState === 'current';
                  const timestamp = currentOrder.statusTimestamps?.[st.key];

                  return (
                    <div key={st.key} className="flex flex-col items-start sm:items-center text-left sm:text-center relative">
                      
                      {/* Step Circle */}
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                          isDone
                            ? 'bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-950/40'
                            : isCurrent
                            ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-zinc-950 ring-4 ring-amber-500/20 shadow-xl shadow-orange-950/50 scale-105'
                            : 'bg-zinc-800 text-zinc-500 border border-zinc-700/60'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isCurrent ? 'stroke-[2.5]' : ''}`} />
                      </div>

                      {/* Step Title & Details */}
                      <div className="mt-3">
                        <h4
                          className={`text-xs font-black ${
                            isCurrent ? 'text-amber-400' : isDone ? 'text-white' : 'text-zinc-500'
                          }`}
                        >
                          {st.title}
                        </h4>
                        <p className="text-[11px] text-zinc-400 hidden sm:block mt-0.5 leading-snug">
                          {st.description}
                        </p>
                        {timestamp && (
                          <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                            {timestamp}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status Live Action Badge */}
            <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-zinc-300">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
                <span className="font-medium">
                  Current Pipeline Status: <strong className="text-white capitalize">{currentOrder.status.replace('_', ' ')}</strong>
                </span>
              </div>
              <span className="text-[11px] text-zinc-500 font-mono">Live Sync</span>
            </div>

          </div>

          {/* 🛵 LIVE FOODPANDA-STYLE DELIVERY MAP (GPS Movement Feature) */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl space-y-0">
            
            {/* Map Header with Live Telemetry */}
            <div className="p-4 bg-zinc-950/80 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-amber-400" />
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                    <span>
                      {currentOrder.status === 'pending'
                        ? 'Restaurant Kitchen Queue • Awaiting Admin'
                        : currentOrder.status === 'preparing'
                        ? 'Kitchen Cooking in Progress • Wok Sizzling'
                        : currentOrder.status === 'delivered'
                        ? 'Delivery Completed • Doorstep'
                        : 'Live Rider GPS Route Tracking'}
                    </span>
                    {isRiderOnRoad && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
                  </h3>
                  <p className="text-[10px] text-zinc-400">
                    {currentOrder.status === 'pending'
                      ? 'Order confirmed. Awaiting restaurant admin approval to start cooking'
                      : currentOrder.status === 'preparing'
                      ? 'Fresh handi & karahi cooking with authentic desi ghee'
                      : currentOrder.status === 'delivered'
                      ? 'Delivered to customer destination in Tando Bago'
                      : "Real-time coordinates updated live from rider's device"}
                  </p>
                </div>
              </div>

              {/* Live telemetry badges */}
              <div className="flex items-center gap-2">
                <span className={`text-[11px] px-2.5 py-1 rounded-xl font-bold border flex items-center gap-1 font-mono ${
                  isRiderOnRoad
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : currentOrder.status === 'preparing'
                    ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                    : 'bg-zinc-800 text-amber-400 border-zinc-700'
                }`}>
                  <Radio className={`w-3 h-3 ${isRiderOnRoad ? 'text-emerald-400 animate-spin' : 'text-amber-400'}`} />
                  <span>
                    {isRiderOnRoad 
                      ? 'GPS Active' 
                      : currentOrder.status === 'preparing'
                      ? 'Kitchen Active'
                      : 'Order Queued'}
                  </span>
                </span>
              </div>
            </div>

            {/* Visual Delivery Map Canvas */}
            <div className="relative h-64 sm:h-72 w-full bg-[#10141d] overflow-hidden flex items-center justify-center p-6 select-none">
              
              {/* Street grid visual texture */}
              <div className="absolute inset-0 opacity-25 pointer-events-none">
                <div className="absolute top-1/4 left-0 right-0 h-px bg-zinc-600" />
                <div className="absolute top-2/4 left-0 right-0 h-px bg-zinc-600" />
                <div className="absolute top-3/4 left-0 right-0 h-px bg-zinc-600" />
                <div className="absolute left-1/4 top-0 bottom-0 w-px bg-zinc-600" />
                <div className="absolute left-2/4 top-0 bottom-0 w-px bg-zinc-600" />
                <div className="absolute left-3/4 top-0 bottom-0 w-px bg-zinc-600" />
              </div>

              {/* Status Banner Overlay when in Kitchen / Pending */}
              {currentOrder.status === 'pending' && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-zinc-950/90 border border-amber-500/50 backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs text-amber-300 pointer-events-none">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="font-bold">Order Received • Waiting for Admin Approval ⏳</span>
                </div>
              )}

              {currentOrder.status === 'preparing' && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-zinc-950/90 border border-orange-500/50 backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs text-orange-300 pointer-events-none">
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />
                  <span className="font-bold">Admin Approved! Taaza Cooking in Kitchen 🍳</span>
                </div>
              )}

              {/* Route Road Canvas SVG */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {/* Background road */}
                <path
                  d="M 60,180 Q 250,50 480,130 T 780,70"
                  fill="none"
                  stroke="#27272a"
                  strokeWidth="12"
                  strokeLinecap="round"
                />
                {/* Active glowing trajectory path */}
                <path
                  d="M 60,180 Q 250,50 480,130 T 780,70"
                  fill="none"
                  stroke={isRiderOnRoad ? "#f59e0b" : "#3f3f46"}
                  strokeWidth="4"
                  strokeDasharray={isRiderOnRoad ? "8 6" : "none"}
                  className={isRiderOnRoad ? "animate-pulse" : ""}
                />
              </svg>

              {/* Pin 1: Restaurant Starting Point */}
              <div className="absolute left-6 sm:left-12 bottom-8 flex flex-col items-center z-10">
                <div className={`w-12 h-12 rounded-2xl border-2 border-white text-white flex items-center justify-center shadow-2xl text-xl ${
                  currentOrder.status === 'preparing'
                    ? 'bg-gradient-to-tr from-orange-600 to-amber-600 animate-bounce ring-4 ring-orange-500/40'
                    : 'bg-gradient-to-tr from-amber-600 to-red-600'
                }`}>
                  {currentOrder.status === 'preparing' ? '🍳' : '🍗'}
                </div>
                <a
                  href={safeSettings.googleMapsUrl || 'https://maps.app.goo.gl/j9TWCvYC6UaRACuf8'}
                  target="_blank"
                  rel="noreferrer"
                  title="Google Maps par Rab Razi Restaurant Tando Bago dekhein"
                  className="mt-1.5 bg-zinc-950/95 border border-amber-500/50 hover:border-amber-400 px-2.5 py-0.5 rounded-lg text-[10px] font-black text-amber-400 shadow-lg whitespace-nowrap flex items-center gap-1 transition-all"
                >
                  <span>Rab Razi, Tando Bago 📍</span>
                </a>
              </div>

              {/* MOVING RIDER ICON (Driven in Real-Time by Live Location Coordinates) */}
              <div 
                className="absolute z-20 flex flex-col items-center transition-all duration-700 pointer-events-none -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: riderLeftStyle,
                  top: riderTopStyle
                }}
              >
                {/* Pulse radar around bike */}
                <div className="relative">
                  <div className={`w-12 h-12 rounded-full text-zinc-950 flex items-center justify-center shadow-2xl ring-4 ${
                    isRiderOnRoad
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 ring-amber-400/40'
                      : currentOrder.status === 'preparing'
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 ring-orange-400/40'
                      : 'bg-zinc-800 text-amber-400 ring-zinc-700'
                  }`}>
                    <Bike className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  {isRiderOnRoad && (
                    <div className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-60" />
                  )}
                </div>

                {/* Floating telemetry tag above rider */}
                <div className="mt-1.5 bg-zinc-950/95 border border-amber-500/80 px-2 py-0.5 rounded-lg text-[10px] font-black text-amber-400 shadow-xl flex items-center gap-1 whitespace-nowrap">
                  <span>{currentOrder.riderName?.split(' ')[0] || 'Rider'}</span>
                  <span>•</span>
                  <span>{isRiderOnRoad ? `${riderLiveLocation?.speed || 32} km/h` : currentOrder.status === 'preparing' ? 'At Kitchen' : 'Standby'}</span>
                </div>
              </div>

              {/* Pin 2: Customer Destination Point */}
              <div className="absolute right-6 sm:right-12 top-6 flex flex-col items-center z-10">
                <div className={`w-12 h-12 rounded-2xl border-2 border-white text-white flex items-center justify-center shadow-2xl text-xl ${
                  currentOrder.status === 'delivered'
                    ? 'bg-emerald-500 ring-4 ring-emerald-400/40 animate-pulse'
                    : 'bg-emerald-600'
                }`}>
                  {currentOrder.status === 'delivered' ? '🎉' : '🏠'}
                </div>
                <div className="mt-1.5 bg-zinc-950/95 border border-zinc-700 px-2.5 py-0.5 rounded-lg text-[10px] font-black text-emerald-400 shadow-lg truncate max-w-[120px]">
                  {currentOrder.customerName || 'Your Destination'}
                </div>
              </div>
            </div>

            {/* Rider Telemetry Footer */}
            <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xl font-black text-amber-400">
                  {currentOrder.status === 'pending'
                    ? '⏳'
                    : currentOrder.status === 'preparing'
                    ? '🍳'
                    : currentOrder.status === 'delivered'
                    ? '✅'
                    : '🛵'}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <span>
                      {currentOrder.status === 'pending'
                        ? 'Awaiting Admin Confirmation'
                        : currentOrder.status === 'preparing'
                        ? 'Chef at Rab Razi Kitchen'
                        : currentOrder.status === 'delivered'
                        ? 'Order Delivered'
                        : (currentOrder.riderName || 'Farhan Tariq (Rider #14)')}
                    </span>
                    <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                      isRiderOnRoad
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : currentOrder.status === 'preparing'
                        ? 'bg-orange-500/20 text-orange-400'
                        : currentOrder.status === 'delivered'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {isRiderOnRoad
                        ? 'Live On Road'
                        : currentOrder.status === 'preparing'
                        ? 'Cooking Now'
                        : currentOrder.status === 'delivered'
                        ? 'Completed'
                        : 'In Queue'}
                    </span>
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    {currentOrder.status === 'pending'
                      ? 'Admin will review and approve order to begin cooking.'
                      : currentOrder.status === 'preparing'
                      ? `Authentic spices simmering. Rider ${currentOrder.riderName || 'assigned'} ready for pickup.`
                      : currentOrder.status === 'delivered'
                      ? 'Enjoy your piping hot meal! Thank you for ordering.'
                      : `Vehicle: ${currentOrder.riderBike || 'Honda CG 125 (BDN-992)'}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {currentOrder.status === 'on_the_way' ? (
                  <a
                    href={`tel:${currentOrder.riderPhone || '0315-7788990'}`}
                    className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Rider</span>
                  </a>
                ) : (
                  <a
                    href={`tel:${safeSettings.phone || '0300-9998877'}`}
                    className="flex-1 sm:flex-none px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Restaurant</span>
                  </a>
                )}

                {/* Open Dedicated Rider App link */}
                <button
                  onClick={switchToRider}
                  className="flex-1 sm:flex-none px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-amber-400 rounded-xl text-xs font-bold border border-zinc-700 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  title="Open Rider App GPS view (#rider)"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Rider Mode</span>
                </button>
              </div>
            </div>
          </div>

          {/* 📍 Restaurant Branch Location & Directions Card */}
          <div className="bg-zinc-900/90 border border-amber-500/30 rounded-3xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-xl flex-shrink-0">
                📍
              </div>
              <div>
                <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                  <span>{safeSettings.restaurantName || 'Rab Razi Restaurant'} (Tando Bago Branch)</span>
                  <span className="text-[10px] bg-zinc-800 text-amber-400 px-2 py-0.5 rounded-full font-mono">
                    Plus Code: {safeSettings.plusCode || 'QXQ6+C96'}
                  </span>
                </h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  {safeSettings.address || 'Main Badin-Mirpurkhas Road, Tando Bago, Sindh'}
                </p>
              </div>
            </div>

            <a
              href={safeSettings.googleMapsUrl || 'https://maps.app.goo.gl/j9TWCvYC6UaRACuf8'}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 text-xs font-black shadow-md transition-all active:scale-95 whitespace-nowrap"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Open in Google Maps ↗</span>
            </a>
          </div>

          {/* Order Details & Invoice Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Order Invoice & Summary
                </h3>
              </div>
              <span className="text-xs text-zinc-400 font-mono">
                Payment: {currentOrder.paymentMethod || 'Cash on Delivery'}
              </span>
            </div>

            {/* Delivery address details */}
            <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800/80 flex items-start gap-2.5 text-xs text-zinc-300">
              <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold">
                  {currentOrder.customerName || 'Valued Guest'} ({currentOrder.customerPhone || 'N/A'})
                </strong>
                <span className="text-zinc-400">{currentOrder.customerAddress || 'Tando Bago, Sindh'}</span>
                {currentOrder.notes && (
                  <p className="text-[11px] text-amber-300/80 italic mt-0.5">
                    Note: "{currentOrder.notes}"
                  </p>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-2 pt-1">
              {(currentOrder.items || []).map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-1.5 border-b border-zinc-800/50"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-zinc-800 text-amber-400 font-bold flex items-center justify-center text-[10px]">
                      {item.quantity}x
                    </span>
                    <span className="font-semibold text-zinc-200">{item.name}</span>
                    {item.portion && (
                      <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded">
                        {item.portion}
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-zinc-200">
                    Rs. {((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-1.5 pt-2 text-xs border-t border-zinc-800 text-zinc-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-zinc-200">Rs. {currentOrder.subtotal?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="text-zinc-200">
                  {currentOrder.deliveryFee === 0 ? 'FREE' : `Rs. ${currentOrder.deliveryFee || 0}`}
                </span>
              </div>
              {currentOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Voucher Discount</span>
                  <span>- Rs. {currentOrder.discount?.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-zinc-800">
                <span>Grand Total</span>
                <span className="text-amber-400 text-base">Rs. {currentOrder.total?.toLocaleString() || '0'}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setCurrentTab('menu')}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Order More Delicious Dishes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
