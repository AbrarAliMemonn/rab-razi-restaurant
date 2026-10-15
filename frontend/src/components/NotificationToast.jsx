import React from 'react';
import { CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function NotificationToast() {
  const { toast } = useApp();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />,
    warning: <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />,
    info: <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
  };

  return (
    <div className="fixed top-18 right-4 sm:right-6 z-50 animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-none">
      <div className="bg-zinc-900/95 border border-zinc-700/80 backdrop-blur-md px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold text-zinc-100 max-w-sm pointer-events-auto">
        {icons[toast.type] || <Sparkles className="w-4 h-4 text-amber-400" />}
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
