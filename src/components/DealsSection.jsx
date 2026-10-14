import React, { useState, useEffect } from 'react';
import { Flame, Clock, Sparkles, Tag, ArrowRight, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import FoodCard from './FoodCard';

export default function DealsSection() {
  const { menuItems, setSelectedItemForModal } = useApp();

  // Fake live countdown timer for deals urgency
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 35, seconds: 20 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 6, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const dealItems = menuItems.filter((item) => item.isDeal);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Deals Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-950 via-zinc-900 to-amber-950/70 border border-red-500/30 p-5 sm:p-7 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-black uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5" />
              <span>Mega Value Combos & Feasts</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-serif">
              Rab Razi Special Deals & Bundles
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-xl">
              Save big on family platters, friends hangout combos, and signature Karahi + BBQ + Biryani feasts prepared fresh daily!
            </p>
          </div>

          {/* Urgency Countdown Timer */}
          <div className="bg-zinc-950/90 border border-red-500/30 px-4 py-3 rounded-2xl flex items-center gap-3">
            <Clock className="w-5 h-5 text-red-400 animate-pulse" />
            <div>
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                Today's Deals Expire In:
              </span>
              <div className="text-base sm:text-lg font-mono font-black text-amber-400">
                {String(timeLeft.hours).padStart(2, '0')}:
                {String(timeLeft.minutes).padStart(2, '0')}:
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {dealItems.map((item) => (
          <FoodCard key={item.id} item={item} />
        ))}
      </div>

      {dealItems.length === 0 && (
        <div className="text-center py-12 bg-zinc-900/50 rounded-3xl border border-zinc-800 text-zinc-400">
          No deals currently active. Check back soon or add one from Admin Panel!
        </div>
      )}

    </div>
  );
}
