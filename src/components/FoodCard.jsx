import React from 'react';
import { Plus, Star, Flame, Tag, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function FoodCard({ item }) {
  const { setSelectedItemForModal, addToCart, cart } = useApp();

  // Check if item is already in cart
  const itemInCartCount = cart
    .filter((ci) => ci.id === item.id)
    .reduce((sum, ci) => sum + ci.quantity, 0);

  const handleCardClick = () => {
    setSelectedItemForModal(item);
  };

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    if (!item.inStock) return;

    // If item has portions or spice choices, open modal for best user experience
    if (item.portionOptions || item.spicyLevel) {
      setSelectedItemForModal(item);
    } else {
      addToCart(item, {}, 1);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative bg-zinc-900/90 rounded-2xl border transition-all duration-200 overflow-hidden cursor-pointer flex flex-col justify-between hover:shadow-xl hover:shadow-orange-950/20 active:scale-[0.99] ${
        item.isDeal
          ? 'border-red-500/30 hover:border-red-500/60'
          : 'border-zinc-800/80 hover:border-amber-500/50'
      } ${!item.inStock ? 'opacity-60 grayscale-[40%]' : ''}`}
    >
      {/* Food Image Container */}
      <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-zinc-800">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            // Fallback image if unsplash link fails
            e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          {item.isDeal && (
            <span className="bg-gradient-to-r from-red-600 to-orange-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3 h-3 fill-current" />
              {item.discountBadge || 'DEAL'}
            </span>
          )}

          {item.tags?.[0] && !item.isDeal && (
            <span className="bg-amber-500/90 text-zinc-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-md">
              {item.tags[0]}
            </span>
          )}
        </div>

        {/* Spicy Level or Sweet badge */}
        {item.spicyLevel && (
          <div className="absolute top-2.5 right-2.5 z-10 bg-zinc-950/80 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-semibold text-zinc-300 border border-zinc-700/60">
            {item.spicyLevel === 'Hot' ? '🌶️🌶️ Hot' : item.spicyLevel === 'Spicy' ? '🌶️ Spicy' : item.spicyLevel === 'Sweet' ? '🍯 Sweet' : '✨ Mild'}
          </div>
        )}

        {/* Rating overlay at bottom edge of image */}
        <div className="absolute bottom-2 left-2.5 flex items-center gap-1 bg-zinc-950/85 backdrop-blur-md px-2 py-0.5 rounded-lg text-[11px] font-bold text-amber-400 border border-zinc-800">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span>{item.rating || 4.9}</span>
          <span className="text-zinc-500 text-[10px]">({item.reviewsCount || 85})</span>
        </div>

        {/* Out of stock ribbon */}
        {!item.inStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-red-900/90 text-white font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider border border-red-500/40">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1 gap-2.5">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-zinc-100 group-hover:text-amber-400 transition-colors line-clamp-1 leading-snug">
            {item.name}
          </h3>
          <p className="text-zinc-400 text-xs mt-1 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black text-amber-400">
                Rs. {item.price.toLocaleString()}
              </span>
              {item.originalPrice && item.originalPrice > item.price && (
                <span className="text-[11px] text-zinc-500 line-through">
                  Rs. {item.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            {item.portionOptions && (
              <span className="text-[10px] text-zinc-400 block -mt-0.5">
                Starting price
              </span>
            )}
          </div>

          {/* Add to Cart button */}
          <button
            onClick={handleQuickAdd}
            disabled={!item.inStock}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all duration-200 active:scale-95 shadow-md ${
              !item.inStock
                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                : itemInCartCount > 0
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
                : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-950/30'
            }`}
          >
            {itemInCartCount > 0 ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>{itemInCartCount}</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
