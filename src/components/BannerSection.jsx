import React, { useState } from 'react';
import { Sparkles, Clock, ShieldCheck, Flame, Tag, Check, Award, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function BannerSection() {
  const { settings, setSelectedCategory, setCurrentTab, showToast } = useApp();
  const [copied, setCopied] = useState(false);

  const copyPromo = () => {
    navigator.clipboard.writeText(settings.promoCode);
    setCopied(true);
    showToast(`Coupon "${settings.promoCode}" copied to clipboard! 📋`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Hero Banner Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950/70 via-zinc-900 to-zinc-950 border border-amber-500/20 shadow-2xl p-4 sm:p-7">
        
        {/* Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wide">
              <Award className="w-3.5 h-3.5" />
              <span>Tando Bago's Most Loved Authentic Kitchen</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight font-serif">
              Rab Razi Restaurant
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
              Indulge in royal Shinwari Karahi, succulent charcoal BBQ, authentic Dum Biryani & crunchy Zinger treats cooked with pure blessing and perfection.
            </p>

            {/* Quick Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-zinc-300">
              <div className="flex items-center gap-1.5 bg-zinc-900/80 px-2.5 py-1 rounded-xl border border-zinc-800">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{settings.estimatedDeliveryTime} Delivery</span>
              </div>
              <div className="flex items-center gap-1.5 bg-zinc-900/80 px-2.5 py-1 rounded-xl border border-zinc-800">
                <span className="text-amber-400 font-bold">★ 4.9</span>
                <span className="text-zinc-400">(2,400+ reviews)</span>
              </div>
              <div className="flex items-center gap-1.5 bg-zinc-900/80 px-2.5 py-1 rounded-xl border border-zinc-800 text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Halal & Fresh</span>
              </div>
            </div>
          </div>

          {/* Promo Coupon Card */}
          <div className="w-full md:w-auto bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 border border-amber-500/30 p-4 rounded-2xl flex flex-col items-center text-center shadow-lg min-w-[220px]">
            <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold flex items-center gap-1">
              <Tag className="w-3 h-3 text-amber-400" /> Exclusive Discount
            </span>
            <span className="text-2xl font-black text-amber-400 mt-1 tracking-tight">
              {settings.promoDiscountPercent}% OFF
            </span>
            <p className="text-[11px] text-zinc-400 mt-0.5">Use code at checkout</p>
            
            <button
              onClick={copyPromo}
              className="mt-2.5 w-full bg-zinc-800 hover:bg-zinc-700/80 border border-dashed border-amber-500/50 text-white font-mono font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 group"
            >
              <span>{settings.promoCode}</span>
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <span className="text-[10px] text-amber-400 font-sans group-hover:underline">Copy</span>
              )}
            </button>

            <button
              onClick={() => {
                setSelectedCategory('deals');
                setCurrentTab('deals');
              }}
              className="mt-3 text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
            >
              <span>Explore Deals</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Story Bubbles / Highlights */}
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => {
            setSelectedCategory('deals');
            setCurrentTab('deals');
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-950/60 to-zinc-900 border border-red-500/30 text-red-300 text-xs font-semibold whitespace-nowrap hover:border-red-400 transition-all active:scale-95"
        >
          <Flame className="w-4 h-4 text-red-500 animate-pulse" />
          <span>Mega Family Deals</span>
        </button>

        <button
          onClick={() => {
            setSelectedCategory('karahi');
            setCurrentTab('menu');
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-950/60 to-zinc-900 border border-amber-500/30 text-amber-300 text-xs font-semibold whitespace-nowrap hover:border-amber-400 transition-all active:scale-95"
        >
          <span>🍲</span>
          <span>Desi Ghee Karahi</span>
        </button>

        <button
          onClick={() => {
            setSelectedCategory('bbq');
            setCurrentTab('menu');
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold whitespace-nowrap hover:border-zinc-700 transition-all active:scale-95"
        >
          <span>🍢</span>
          <span>Charcoal BBQ Platter</span>
        </button>

        <button
          onClick={() => {
            setSelectedCategory('biryani');
            setCurrentTab('menu');
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold whitespace-nowrap hover:border-zinc-700 transition-all active:scale-95"
        >
          <span>🍚</span>
          <span>Matka Dum Biryani</span>
        </button>

        <button
          onClick={() => {
            setSelectedCategory('fastfood');
            setCurrentTab('menu');
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold whitespace-nowrap hover:border-zinc-700 transition-all active:scale-95"
        >
          <span>🍔</span>
          <span>Crispy Zingers</span>
        </button>
      </div>
    </div>
  );
}
