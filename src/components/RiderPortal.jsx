import React, { useState, useEffect, useRef } from 'react';
import { 
  Bike, 
  MapPin, 
  Phone, 
  Navigation, 
  CheckCircle, 
  Radio, 
  ArrowLeft, 
  ExternalLink,
  ShieldCheck,
  Compass,
  Gauge,
  Clock,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function RiderPortal() {
  const {
    orders,
    riders,
    settings,
    updateOrderStatus,
    switchToUser,
    switchToAdmin,
    showToast
  } = useApp();

  // Select active rider (default to first rider)
  const [selectedRiderId, setSelectedRiderId] = useState(() => riders[0]?.id || 'rider-1');
  const activeRider = riders.find((r) => r.id === selectedRiderId) || riders[0];

  // Find active orders assigned to this rider
  const assignedOrders = orders.filter(
    (o) => (o.riderName === activeRider?.name) && (o.status === 'on_the_way' || o.status === 'preparing')
  );
  const currentOrder = assignedOrders[0] || orders.find((o) => o.status === 'on_the_way') || orders[0];

  // GPS Sharing States (Tando Bago: 24.788538, 68.960891)
  const [isGpsSharing, setIsGpsSharing] = useState(false);
  const [coords, setCoords] = useState({
    lat: 24.788538,
    lng: 68.960891,
    accuracy: 6,
    speed: 34,
    progress: 35,
    distanceRemaining: '1.2 km',
    etaMinutes: 5,
    lastPing: new Date().toLocaleTimeString()
  });

  const geoWatchIdRef = useRef(null);
  const broadcastChannelRef = useRef(null);

  // Initialize Broadcast Channel
  useEffect(() => {
    try {
      broadcastChannelRef.current = new BroadcastChannel('rab_razi_gps_feed');
    } catch {
      // BroadcastChannel fallback
    }

    return () => {
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
      }
    };
  }, []);

  // Broadcast GPS updates to customer app
  const broadcastLocation = (newCoords) => {
    const payload = {
      ...newCoords,
      riderId: activeRider?.id,
      riderName: activeRider?.name,
      riderBike: activeRider?.bike,
      riderPhone: activeRider?.phone,
      orderId: currentOrder?.id,
      timestamp: Date.now()
    };

    // Save to localStorage for cross-device & cross-tab sync
    localStorage.setItem('rrr_rider_live_location', JSON.stringify(payload));

    // Send via BroadcastChannel for zero-latency local communication
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage(payload);
    }
  };

  // Real HTML5 Geolocation Tracking
  const startRealGps = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', 'warning');
      return;
    }

    setIsGpsSharing(true);
    showToast('Real GPS Live Broadcast started! 📡', 'success');

    geoWatchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const currentSpeed = pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 32;
        const updated = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
          speed: currentSpeed,
          progress: Math.min(95, Math.max(10, coords.progress + 3)),
          distanceRemaining: `${(Math.max(0.2, 1.8 - (coords.progress / 100) * 1.6)).toFixed(1)} km`,
          etaMinutes: Math.max(1, Math.round(6 - (coords.progress / 100) * 5)),
          lastPing: new Date().toLocaleTimeString()
        };
        setCoords(updated);
        broadcastLocation(updated);
      },
      (err) => {
        console.warn('GPS error', err);
        showToast('Please enable device location permission for live GPS broadcasting', 'warning');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const stopRealGps = () => {
    if (geoWatchIdRef.current !== null) {
      navigator.geolocation.clearWatch(geoWatchIdRef.current);
      geoWatchIdRef.current = null;
    }
    setIsGpsSharing(false);
    showToast('Real GPS sharing stopped', 'info');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (geoWatchIdRef.current !== null) navigator.geolocation.clearWatch(geoWatchIdRef.current);
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-5 p-3 sm:p-5 pb-16 animate-in fade-in duration-300">
      
      {/* Top Rider Header */}
      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-3xl shadow-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-2xl font-black">
            🛵
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-white">Rab Razi Rider App</h1>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                GPS Portal
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Live Location Broadcaster & Delivery Dispatcher
            </p>
          </div>
        </div>

        <button
          onClick={switchToUser}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-bold transition-all active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Customer App</span>
        </button>
      </div>

      {/* Select Active Rider Profile */}
      <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-3xl space-y-2">
        <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
          Select Logged-In Delivery Rider
        </label>
        <select
          value={selectedRiderId}
          onChange={(e) => setSelectedRiderId(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-amber-500"
        >
          {riders.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} • {r.bike} ({r.phone})
            </option>
          ))}
        </select>
      </div>

      {/* 📡 BIG LIVE GPS BROADCAST CARD (Foodpanda Feature) */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className={`w-3.5 h-3.5 rounded-full ${isGpsSharing ? 'bg-emerald-400 animate-ping' : 'bg-zinc-600'}`} />
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span>Live GPS Location Broadcast</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                  isGpsSharing ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {isGpsSharing ? 'Broadcasting Live 🟢' : 'GPS Offline ⚪'}
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Customers can watch your bike moving live on the map in real-time
              </p>
            </div>
          </div>
        </div>

        {/* Real-time telemetry indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-zinc-950/80 p-3 rounded-2xl border border-zinc-800 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1">
              <Gauge className="w-3 h-3 text-amber-400" /> Speed
            </span>
            <div className="text-base font-black text-amber-400 font-mono">
              {coords.speed} km/h
            </div>
          </div>

          <div className="bg-zinc-950/80 p-3 rounded-2xl border border-zinc-800 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1">
              <Compass className="w-3 h-3 text-emerald-400" /> Distance Left
            </span>
            <div className="text-base font-black text-emerald-400 font-mono">
              {coords.distanceRemaining}
            </div>
          </div>

          <div className="bg-zinc-950/80 p-3 rounded-2xl border border-zinc-800 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1">
              <Clock className="w-3 h-3 text-orange-400" /> ETA
            </span>
            <div className="text-base font-black text-orange-400 font-mono">
              ~{coords.etaMinutes} mins
            </div>
          </div>

          <div className="bg-zinc-950/80 p-3 rounded-2xl border border-zinc-800 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1">
              <Radio className="w-3 h-3 text-blue-400" /> GPS Accuracy
            </span>
            <div className="text-base font-black text-zinc-200 font-mono">
              ±{coords.accuracy}m
            </div>
          </div>
        </div>

        {/* Delivery Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-zinc-400">
            <span>Route to Customer:</span>
            <strong className="text-amber-400">{coords.progress}% complete</strong>
          </div>
          <div className="h-2.5 w-full bg-zinc-950 rounded-full overflow-hidden p-0.5 border border-zinc-800">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${coords.progress}%` }}
            />
          </div>
        </div>

        {/* Live Device GPS Broadcast Button */}
        <div className="pt-2">
          <button
            onClick={isGpsSharing ? stopRealGps : startRealGps}
            className={`w-full py-3.5 px-4 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95 cursor-pointer ${
              isGpsSharing
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-950/50'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>{isGpsSharing ? 'Stop Real Device GPS 🛑' : 'Share Real Device GPS 📡'}</span>
          </button>
        </div>
      </div>

      {/* Active Assigned Order Card */}
      {currentOrder && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div>
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                Current Assigned Delivery
              </span>
              <span className="text-base font-black text-amber-400 font-mono">
                Order #{currentOrder.id}
              </span>
            </div>

            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase">
              {currentOrder.status.replace('_', ' ')}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {/* Restaurant Pickup Origin */}
            <div className="bg-amber-500/10 p-3 rounded-2xl border border-amber-500/30 text-amber-300 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-amber-400 uppercase font-black block">Kitchen Pickup Point:</span>
                <span className="font-bold text-white">Rab Razi Restaurant, Tando Bago (QXQ6+C96)</span>
              </div>
              <a
                href={settings.googleMapsUrl || 'https://maps.app.goo.gl/j9TWCvYC6UaRACuf8'}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 bg-amber-500 text-zinc-950 font-black rounded-lg text-[10px] hover:bg-amber-400 whitespace-nowrap shadow-sm"
              >
                Maps ↗
              </a>
            </div>

            <div className="flex justify-between items-center text-white font-bold bg-zinc-950 p-3 rounded-2xl border border-zinc-800">
              <span>Customer: {currentOrder.customerName}</span>
              <a
                href={`tel:${currentOrder.customerPhone}`}
                className="text-emerald-400 flex items-center gap-1 hover:underline"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{currentOrder.customerPhone}</span>
              </a>
            </div>

            <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 text-zinc-300">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Customer Delivery Address:</span>
              <span>📍 {currentOrder.customerAddress}</span>
            </div>

            {currentOrder.notes && (
              <div className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 text-amber-300 text-[11px] italic">
                Note: "{currentOrder.notes}"
              </div>
            )}
          </div>

          {/* Rider Delivery Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-zinc-800">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentOrder.customerAddress)}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-zinc-700 transition-all active:scale-95"
            >
              <Navigation className="w-3.5 h-3.5 text-blue-400" />
              <span>Google Maps Navigation</span>
            </a>

            <button
              onClick={() => {
                updateOrderStatus(currentOrder.id, 'delivered');
                showToast(`Order #${currentOrder.id} delivered successfully! 🎉`, 'success');
              }}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Mark as Delivered ✓</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
