import React from 'react';
import { DEFAULT_CATEGORIES } from '../data/mockData';
import { useApp } from '../context/AppContext';

export default function CategoryPills() {
  const { selectedCategory, setSelectedCategory, menuItems } = useApp();

  return (
    <div className="py-2.5 overflow-x-auto no-scrollbar flex items-center gap-2 px-1 scroll-smooth">
      {DEFAULT_CATEGORIES.map((cat) => {
        const isSelected = selectedCategory === cat.id;
        const itemCount =
          cat.id === 'all'
            ? menuItems.length
            : cat.id === 'deals'
            ? menuItems.filter((i) => i.isDeal).length
            : menuItems.filter((i) => i.category === cat.id).length;

        return (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 flex-shrink-0 ${
              isSelected
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20 font-bold scale-[1.02]'
                : 'bg-zinc-900/90 text-zinc-300 border border-zinc-800/80 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            <span className="text-sm">{cat.icon}</span>
            <span>{cat.name}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                isSelected
                  ? 'bg-zinc-950/20 text-zinc-950 font-black'
                  : 'bg-zinc-800 text-zinc-400 font-medium'
              }`}
            >
              {itemCount}
            </span>
          </button>
        );
      })}
    </div>
  );
}
