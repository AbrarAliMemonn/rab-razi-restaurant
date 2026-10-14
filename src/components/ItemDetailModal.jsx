import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Star, Flame, Sparkles, ShoppingBag } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ItemDetailModal() {
  const { selectedItemForModal, setSelectedItemForModal, addToCart } = useApp();

  const item = selectedItemForModal;

  const [quantity, setQuantity] = useState(1);
  const [selectedPortion, setSelectedPortion] = useState(null);
  const [spiceLevel, setSpiceLevel] = useState('Medium');
  const [specialNote, setSpecialNote] = useState('');

  // Reset local customization whenever opened
  useEffect(() => {
    if (item) {
      setQuantity(1);
      setSelectedPortion(item.portionOptions ? item.portionOptions[0] : null);
      setSpiceLevel(item.spicyLevel || 'Medium');
      setSpecialNote('');
    }
  }, [item]);

  if (!item) return null;

  // Portion pricing logic (e.g., if Full is selected, scale or add price)
  let extraPrice = 0;
  if (selectedPortion && selectedPortion.includes('Full')) {
    extraPrice = Math.round(item.price * 0.85); // Full portion upgrade
  }

  const unitPrice = item.price + extraPrice;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    addToCart(
      item,
      {
        portion: selectedPortion,
        spice: spiceLevel,
        extraPrice,
        note: specialNote
      },
      quantity
    );
    setSelectedItemForModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm transition-all duration-300">
      
      {/* Modal / Bottom Sheet Box */}
      <div 
        className="w-full sm:max-w-lg bg-zinc-900 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col animate-in fade-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header with image */}
        <div className="relative h-56 sm:h-64 w-full bg-zinc-950 flex-shrink-0">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-black/40" />

          {/* Close Button */}
          <button
            onClick={() => setSelectedItemForModal(null)}
            className="absolute top-3 right-3 bg-zinc-950/80 hover:bg-zinc-800 text-zinc-300 hover:text-white p-2 rounded-full border border-zinc-700/60 backdrop-blur-md transition-all active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badges on image */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {item.isDeal && (
                <span className="bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-lg">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  {item.discountBadge || 'DEAL'}
                </span>
              )}
              {item.tags?.[0] && (
                <span className="bg-amber-500 text-zinc-950 text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                  {item.tags[0]}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 bg-zinc-950/90 backdrop-blur-md px-2.5 py-1 rounded-xl text-xs font-bold text-amber-400 border border-zinc-800">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{item.rating || 4.9}</span>
              <span className="text-zinc-500 text-[10px]">({item.reviewsCount || 90}+)</span>
            </div>
          </div>
        </div>

        {/* Scrollable Content Details */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 no-scrollbar">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-serif leading-tight">
              {item.name}
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Portion Selection if available */}
          {item.portionOptions && (
            <div className="space-y-2 pt-2 border-t border-zinc-800/80">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                Select Portion Size
              </label>
              <div className="grid grid-cols-2 gap-2">
                {item.portionOptions.map((portion) => {
                  const isFull = portion.includes('Full');
                  const portionAddedPrice = isFull ? Math.round(item.price * 0.85) : 0;
                  const isSelected = selectedPortion === portion;

                  return (
                    <button
                      key={portion}
                      type="button"
                      onClick={() => setSelectedPortion(portion)}
                      className={`p-3 rounded-2xl border text-left transition-all text-xs font-semibold flex items-center justify-between ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 text-amber-400 ring-1 ring-amber-500/40'
                          : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-300 hover:border-zinc-600'
                      }`}
                    >
                      <span>{portion}</span>
                      <span className="text-[11px] text-zinc-400">
                        {portionAddedPrice > 0 ? `+Rs. ${portionAddedPrice}` : 'Standard'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Spice Level selection */}
          <div className="space-y-2 pt-2 border-t border-zinc-800/80">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
              Spice Preference
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Mild', label: '🌿 Mild' },
                { id: 'Medium', label: '🌶️ Medium' },
                { id: 'Hot', label: '🔥 Extra Spicy' }
              ].map((spice) => (
                <button
                  key={spice.id}
                  type="button"
                  onClick={() => setSpiceLevel(spice.id)}
                  className={`py-2 px-2 rounded-xl border text-center text-xs font-semibold transition-all ${
                    spiceLevel === spice.id
                      ? 'bg-amber-500 text-zinc-950 font-bold border-amber-400 shadow-md'
                      : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-400 hover:text-white'
                  }`}
                >
                  {spice.label}
                </button>
              ))}
            </div>
          </div>

          {/* Special Kitchen Request Note */}
          <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
              Special Instructions for Kitchen
            </label>
            <input
              type="text"
              value={specialNote}
              onChange={(e) => setSpecialNote(e.target.value)}
              placeholder="e.g. Extra raita, less oil, well done meat..."
              className="w-full bg-zinc-800/70 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Footer with Quantity & Add to Cart */}
        <div className="p-4 sm:p-5 bg-zinc-950/90 border-t border-zinc-800 flex items-center justify-between gap-4 mt-auto">
          {/* Quantity Stepper */}
          <div className="flex items-center gap-3 bg-zinc-800/90 border border-zinc-700/70 rounded-2xl p-1.5">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="w-8 h-8 rounded-xl bg-zinc-700/80 hover:bg-zinc-600 disabled:opacity-40 text-white flex items-center justify-center transition-all active:scale-90"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-6 text-center font-black text-sm text-white">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-8 h-8 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center justify-center font-bold transition-all active:scale-90"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
            </button>
          </div>

          {/* Action Button */}
          <button
            onClick={handleAddToCart}
            disabled={!item.inStock}
            className="flex-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-black text-sm py-3 px-4 rounded-2xl shadow-xl shadow-orange-950/40 flex items-center justify-between transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <span className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
              <span>Add to Cart</span>
            </span>
            <span className="bg-zinc-950/30 px-2.5 py-1 rounded-xl text-xs font-black tracking-wide">
              Rs. {totalPrice.toLocaleString()}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}
