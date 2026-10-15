import React from 'react';
import { Home, UtensilsCrossed, Flame, Bike, ShoppingBag } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function BottomNav() {
  const {
    currentTab,
    setCurrentTab,
    cartTotalCount,
    setIsCartOpen,
    orders
  } = useApp();

  // Check if there is an active running order (pending, preparing, on_the_way)
  const hasActiveOrder = orders.some(
    (o) => o.status === 'pending' || o.status === 'preparing' || o.status === 'on_the_way'
  );

  const customerNavItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
    { id: 'deals', label: 'Deals', icon: Flame, badge: 'HOT' },
    { id: 'tracking', label: 'Track', icon: Bike, hasPulse: hasActiveOrder }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-800/80 px-2 py-1.5 shadow-2xl safe-area-pb">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {customerNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-amber-400 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 font-medium'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.5]' : 'stroke-2'
                  }`}
                />

                {/* Hot Deals Badge */}
                {item.badge && (
                  <span className="absolute -top-1.5 -right-3 bg-red-600 text-white text-[9px] font-black px-1 rounded-full uppercase leading-tight animate-bounce">
                    {item.badge}
                  </span>
                )}

                {/* Active Tracking Pulse */}
                {item.hasPulse && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                )}
              </div>

              <span className="text-[10px] mt-1 tracking-tight">
                {item.label}
              </span>

              {/* Active pill under icon */}
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-amber-400 mt-0.5"></span>
              )}
            </button>
          );
        })}

        {/* Customer Cart Button in Bottom Navigation */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl text-zinc-400 hover:text-amber-400 active:scale-95 relative"
          title="Open Food Cart"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 stroke-2" />
            {cartTotalCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-amber-500 text-zinc-950 text-[10px] font-black px-1.5 py-0.2 rounded-full min-w-[16px] text-center">
                {cartTotalCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 font-semibold">
            Basket
          </span>
        </button>
      </div>
    </div>
  );
}
