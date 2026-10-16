import React, { useState } from 'react';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  LogOut, 
  Plus, 
  Check, 
  Package, 
  Bike, 
  ArrowRight,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function UserProfileModal() {
  const { 
    currentUser, 
    isProfileModalOpen, 
    setIsProfileModalOpen, 
    logoutUser, 
    addUserAddress,
    orders,
    setActiveOrderId,
    setCurrentTab,
    showToast
  } = useApp();

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newLabel, setNewLabel] = useState('Home');
  const [newAddressText, setNewAddressText] = useState('');

  if (!isProfileModalOpen || !currentUser) return null;

  // Filter orders strictly for this user
  const userOrders = orders.filter(
    (o) =>
      (o.userId && o.userId === currentUser.id) ||
      (o.customerEmail && currentUser.email && o.customerEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
      (o.customerPhone && currentUser.phone && o.customerPhone === currentUser.phone)
  );

  const handleAddAddressSubmit = (e) => {
    e.preventDefault();
    if (!newAddressText.trim()) return;

    if (addUserAddress) {
      addUserAddress({
        label: newLabel,
        address: newAddressText.trim(),
        isDefault: false
      });
    }

    setNewAddressText('');
    setIsAddingAddress(false);
    showToast('New address saved to your profile!', 'success');
  };

  const handleTrackOrder = (orderId) => {
    setActiveOrderId(orderId);
    setIsProfileModalOpen(false);
    setCurrentTab('tracking');
    showToast(`Showing live tracking for Order #${orderId}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Profile Banner */}
        <div className="relative bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-6 text-white overflow-hidden">
          <button
            onClick={() => setIsProfileModalOpen(false)}
            className="absolute right-4 top-4 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-950 border-2 border-white/40 flex items-center justify-center text-2xl font-black text-amber-400 shadow-xl flex-shrink-0">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : '👤'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black">{currentUser.name}</h3>
                {currentUser.role === 'admin' && (
                  <span className="bg-zinc-950/80 text-amber-400 border border-amber-400/40 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-100/90 flex items-center gap-1.5 mt-0.5">
                <Phone className="w-3 h-3 text-amber-300" />
                <span>{currentUser.phone || 'No phone added'}</span>
              </p>
              {currentUser.email && (
                <p className="text-[11px] text-amber-200/80 flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3 h-3" />
                  <span>{currentUser.email}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Saved Addresses Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>Saved Delivery Addresses</span>
              </h4>
              <button
                onClick={() => setIsAddingAddress(!isAddingAddress)}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAddingAddress ? 'Cancel' : 'Add Address'}</span>
              </button>
            </div>

            {/* Inline Add Address Form */}
            {isAddingAddress && (
              <form onSubmit={handleAddAddressSubmit} className="p-3.5 rounded-2xl bg-zinc-950 border border-amber-500/40 space-y-2.5 animate-in slide-in-from-top-2">
                <div className="flex gap-2">
                  {['Home', 'Office', 'Other'].map((lbl) => (
                    <button
                      type="button"
                      key={lbl}
                      onClick={() => setNewLabel(lbl)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        newLabel === lbl 
                          ? 'bg-amber-500 text-zinc-950 border-amber-400' 
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={newAddressText}
                  onChange={(e) => setNewAddressText(e.target.value)}
                  placeholder="e.g. House 14, Near Shahi Bazaar, Tando Bago"
                  required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black rounded-xl text-xs transition-all active:scale-95 cursor-pointer shadow-md"
                >
                  Save Address
                </button>
              </form>
            )}

            {/* Address List */}
            <div className="space-y-2">
              {currentUser.addresses && currentUser.addresses.length > 0 ? (
                currentUser.addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400 mt-0.5 flex-shrink-0 font-bold">
                        📍
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-white font-bold">{addr.label}</strong>
                          {addr.isDefault && (
                            <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-bold px-1.5 py-0.2 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-zinc-400 text-[11px] mt-0.5 leading-relaxed">{addr.address}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 bg-zinc-950 rounded-2xl border border-zinc-800 text-xs text-zinc-500">
                  No addresses saved yet. Click "+ Add Address" above.
                </div>
              )}
            </div>
          </div>

          {/* User Orders History */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-amber-500" />
              <span>My Orders History ({userOrders.length})</span>
            </h4>

            {userOrders.length > 0 ? (
              <div className="space-y-2">
                {userOrders.slice(0, 5).map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-white font-mono font-bold">#{ord.id}</strong>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          ord.status === 'delivered'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : ord.status === 'on_the_way'
                            ? 'bg-amber-500/20 text-amber-400 animate-pulse'
                            : 'bg-orange-500/20 text-orange-400'
                        }`}>
                          {ord.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-zinc-400 text-[11px] mt-1">
                        Rs. {ord.total?.toLocaleString()} • {ord.items?.length || 1} items
                      </p>
                    </div>

                    <button
                      onClick={() => handleTrackOrder(ord.id)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-bold text-[11px] flex items-center gap-1 transition-all active:scale-95 cursor-pointer border border-zinc-700"
                    >
                      <Bike className="w-3 h-3" />
                      <span>Track</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-zinc-950 rounded-2xl border border-zinc-800 text-xs text-zinc-500">
                You haven't placed any orders yet. Delicious food awaits in the menu!
              </div>
            )}
          </div>

          {/* Logout Button */}
          <div className="pt-2 border-t border-zinc-800">
            <button
              onClick={logoutUser}
              className="w-full py-2.5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out from Account</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
