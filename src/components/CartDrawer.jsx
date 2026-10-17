import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Tag, 
  ArrowRight, 
  Bike, 
  Store, 
  CreditCard, 
  Banknote, 
  Smartphone,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Copy,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    removeFromCart,
    updateCartQuantity,
    cartSubtotal,
    settings,
    deliveryMode,
    setDeliveryMode,
    userLocation,
    placeOrder,
    showToast,
    currentUser,
    setIsAuthModalOpen,
    setAuthModalTab
  } = useApp();

  // Form states
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [customerAddress, setCustomerAddress] = useState(() => {
    if (currentUser?.addresses?.length > 0) {
      const def = currentUser.addresses.find((a) => a.isDefault) || currentUser.addresses[0];
      return def?.address || userLocation || '';
    }
    return userLocation || '';
  });
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [transactionId, setTransactionId] = useState('');
  const [copiedAccount, setCopiedAccount] = useState(false);

  const handleCopyAccount = (number) => {
    navigator.clipboard.writeText(number);
    setCopiedAccount(true);
    showToast(`Account number ${number} copied to clipboard! 📋`, 'info');
    setTimeout(() => setCopiedAccount(false), 2500);
  };

  // Auto-sync customer details when user logs in or drawer opens
  useEffect(() => {
    if (currentUser) {
      if (currentUser.name) setCustomerName(currentUser.name);
      if (currentUser.phone) setCustomerPhone(currentUser.phone);
      if (currentUser.addresses?.length > 0) {
        const def = currentUser.addresses.find((a) => a.isDefault) || currentUser.addresses[0];
        if (def?.address) setCustomerAddress(def.address);
      }
    }
  }, [currentUser, isCartOpen]);
  
  // Promo voucher state
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  if (!isCartOpen) return null;

  // Calculation
  const isFreeDelivery = deliveryMode !== 'delivery' || cartSubtotal >= settings.freeDeliveryThreshold;
  const deliveryFee = deliveryMode === 'delivery' ? (isFreeDelivery ? 0 : settings.deliveryFee) : 0;
  
  const discountAmount = appliedPromo 
    ? Math.round((cartSubtotal * appliedPromo.percent) / 100) 
    : 0;

  const grandTotal = Math.max(0, cartSubtotal + deliveryFee - discountAmount);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    if (code === settings.promoCode) {
      setAppliedPromo({
        code,
        percent: settings.promoDiscountPercent
      });
      showToast(`Promo "${code}" applied! ${settings.promoDiscountPercent}% OFF 🎉`);
    } else if (code === 'FREEDELIVERY') {
      setAppliedPromo({
        code,
        percent: 5
      });
      showToast('Free delivery promo applied! 🛵');
    } else {
      showToast('Invalid promo code. Try "RAZI20"', 'warning');
    }
  };

  const handlePlaceOrder = (e) => {
    if (e) e.preventDefault();

    if (cart.length === 0) {
      showToast('Your cart is empty!', 'warning');
      return;
    }

    if (!customerName.trim()) {
      showToast('Please enter your full name', 'warning');
      return;
    }

    if (!customerPhone.trim() || customerPhone.length < 10) {
      showToast('Please enter a valid phone number (at least 10 digits)', 'warning');
      return;
    }

    if (deliveryMode === 'delivery' && !customerAddress.trim()) {
      showToast('Please enter your delivery address in Tando Bago', 'warning');
      return;
    }

    setIsCheckingOut(true);

    setTimeout(() => {
      placeOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: deliveryMode === 'delivery' ? customerAddress.trim() : settings.address,
        deliveryType: deliveryMode === 'delivery' ? 'Delivery' : 'Takeaway',
        notes: orderNotes.trim(),
        paymentMethod,
        transactionId: transactionId.trim(),
        subtotal: cartSubtotal,
        deliveryFee,
        discount: discountAmount,
        total: grandTotal
      });
      setIsCheckingOut(false);
    }, 600);
  };

  const handleWhatsAppOrder = (e) => {
    if (e) e.preventDefault();

    if (cart.length === 0) {
      showToast('Your cart is empty!', 'warning');
      return;
    }

    if (!customerName.trim()) {
      showToast('Please enter your full name', 'warning');
      return;
    }

    if (!customerPhone.trim() || customerPhone.length < 10) {
      showToast('Please enter a valid phone number (at least 10 digits)', 'warning');
      return;
    }

    if (deliveryMode === 'delivery' && !customerAddress.trim()) {
      showToast('Please enter your delivery address in Tando Bago', 'warning');
      return;
    }

    setIsCheckingOut(true);

    const orderId = placeOrder({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: deliveryMode === 'delivery' ? customerAddress.trim() : settings.address,
      deliveryType: deliveryMode === 'delivery' ? 'Delivery' : 'Takeaway',
      notes: orderNotes.trim(),
      paymentMethod,
      transactionId: transactionId.trim(),
      subtotal: cartSubtotal,
      deliveryFee,
      discount: discountAmount,
      total: grandTotal
    });

    const waNumber = settings.whatsappRaw || '923009998877';
    const dateStr = new Date().toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' });

    const itemsList = cart.map((item, idx) => {
      const details = [];
      if (item.portion) details.push(item.portion);
      if (item.spice) details.push(item.spice);
      const extra = details.length > 0 ? ` (${details.join(', ')})` : '';
      return `${idx + 1}. *${item.name}* x ${item.quantity} = Rs. ${(item.price * item.quantity).toLocaleString()}${extra}`;
    }).join('\n');

    let msg = `🍗 *RAB RAZI RESTAURANT ORDER*\n`;
    msg += `🆔 *Order ID:* #${orderId}\n`;
    msg += `📅 *Date & Time:* ${dateStr}\n\n`;
    msg += `👤 *Customer Details:*\n`;
    msg += `• Name: ${customerName.trim()}\n`;
    msg += `• Phone: ${customerPhone.trim()}\n`;
    msg += `• Delivery Type: ${deliveryMode === 'delivery' ? '🛵 Home Delivery' : '🥡 Takeaway Pickup'}\n`;
    msg += `• Address: ${deliveryMode === 'delivery' ? customerAddress.trim() : settings.address}\n`;
    if (orderNotes.trim()) {
      msg += `• Special Instructions: "${orderNotes.trim()}"\n`;
    }
    msg += `\n🛒 *Order Items:*\n${itemsList}\n\n`;
    msg += `💰 *Bill Summary:*\n`;
    msg += `• Subtotal: Rs. ${cartSubtotal.toLocaleString()}\n`;
    msg += `• Delivery Fee: ${deliveryFee === 0 ? 'FREE' : `Rs. ${deliveryFee}`}\n`;
    if (discountAmount > 0) {
      msg += `• Discount (${appliedPromo?.code || 'Promo'}): -Rs. ${discountAmount.toLocaleString()}\n`;
    }
    msg += `• *Grand Total: Rs. ${grandTotal.toLocaleString()} PKR*\n`;
    msg += `• Payment Method: ${paymentMethod}\n`;
    if (transactionId.trim()) {
      msg += `• *Transaction ID (TID):* ${transactionId.trim()}\n`;
    }
    msg += `\n📍 *Rab Razi Restaurant - Tando Bago, Sindh*\n`;
    msg += `Please confirm my order and share preparation time. Thank you!`;

    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');

    setIsCheckingOut(false);
    showToast(`Order #${orderId} confirmed! Opening WhatsApp... 💬`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-xs transition-opacity duration-300">
      
      {/* Drawer Container */}
      <div 
        className="w-full sm:max-w-md bg-zinc-950 border-l border-zinc-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/90 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Your Food Basket</h2>
              <p className="text-[11px] text-zinc-400">
                {cart.length} {cart.length === 1 ? 'item' : 'items'} in order
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 no-scrollbar">
          
          {/* Delivery Mode Toggle in Cart */}
          <div className="grid grid-cols-2 gap-2 bg-zinc-900 p-1 rounded-2xl border border-zinc-800">
            <button
              type="button"
              onClick={() => setDeliveryMode('delivery')}
              className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                deliveryMode === 'delivery'
                  ? 'bg-amber-500 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Door Delivery</span>
            </button>

            <button
              type="button"
              onClick={() => setDeliveryMode('pickup')}
              className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                deliveryMode === 'pickup'
                  ? 'bg-amber-500 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Self Pickup</span>
            </button>
          </div>

          {/* Cart Items List */}
          {cart.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-3xl">
                🍲
              </div>
              <h3 className="font-bold text-zinc-200 text-base">Your cart is empty</h3>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                Discover mouth-watering Karahi, BBQ and Special Deals to add to your order.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-3 px-5 py-2.5 bg-amber-500 text-zinc-950 text-xs font-black rounded-xl hover:bg-amber-400 transition-all shadow-md"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.cartKey}
                  className="bg-zinc-900/80 rounded-2xl p-3 border border-zinc-800/80 flex items-center gap-3 group"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-zinc-800"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-zinc-100 truncate">
                      {item.name}
                    </h4>

                    {/* Customizations tags */}
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {item.portion && (
                        <span className="text-[10px] bg-zinc-800 text-amber-400 px-1.5 py-0.2 rounded font-medium">
                          {item.portion}
                        </span>
                      )}
                      {item.spice && (
                        <span className="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.2 rounded font-medium">
                          {item.spice}
                        </span>
                      )}
                    </div>

                    {item.note && (
                      <p className="text-[10px] text-zinc-400 italic truncate mt-0.5">
                        "{item.note}"
                      </p>
                    )}

                    <div className="text-xs font-black text-amber-400 mt-1">
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>

                  {/* Quantity Stepper & Remove */}
                  <div className="flex flex-col items-end justify-between h-full gap-2">
                    <button
                      onClick={() => removeFromCart(item.cartKey)}
                      className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-1.5 bg-zinc-800/90 rounded-xl px-1.5 py-0.5 border border-zinc-700/60">
                      <button
                        onClick={() => updateCartQuantity(item.cartKey, -1)}
                        className="w-5 h-5 rounded text-zinc-300 hover:bg-zinc-700 flex items-center justify-center text-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-black text-white w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.cartKey, 1)}
                        className="w-5 h-5 rounded text-zinc-300 hover:bg-zinc-700 flex items-center justify-center text-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {cart.length > 0 && (
            <>
              {/* Promo Code Input */}
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Enter code (try RAZI20)"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 border border-zinc-700"
                >
                  Apply
                </button>
              </form>

              {appliedPromo && (
                <div className="flex items-center justify-between bg-emerald-950/40 border border-emerald-500/30 px-3 py-2 rounded-xl text-xs text-emerald-400">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Coupon "{appliedPromo.code}" Active ({appliedPromo.percent}% OFF)
                  </span>
                  <button
                    onClick={() => setAppliedPromo(null)}
                    className="text-emerald-500 hover:text-emerald-300 text-[10px] underline"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Checkout Customer Details */}
              <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                    <span>Customer Details</span>
                  </h4>
                  {!currentUser ? (
                    <button
                      type="button"
                      onClick={() => { setAuthModalTab('login'); setIsAuthModalOpen(true); }}
                      className="text-amber-400 hover:text-amber-300 text-[11px] font-bold underline cursor-pointer"
                    >
                      Sign in for 1-click checkout
                    </button>
                  ) : (
                    <span className="text-emerald-400 text-[10px] font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      ✓ Auto-filled
                    </span>
                  )}
                </div>

                <div className="space-y-2.5">
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Your Full Name *"
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />

                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Mobile Number (e.g. 0300-1234567) *"
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />

                  {deliveryMode === 'delivery' ? (
                    <textarea
                      rows={2}
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="Complete Delivery Address (House #, Street, Mohalla in Tando Bago) *"
                      required
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                    />
                  ) : (
                    <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-3 text-xs text-amber-300 space-y-1">
                      <div className="font-bold flex items-center justify-between">
                        <span>🥡 Self-Pickup Location:</span>
                        <a
                          href={settings.googleMapsUrl || 'https://maps.app.goo.gl/j9TWCvYC6UaRACuf8'}
                          target="_blank"
                          rel="noreferrer"
                          className="text-amber-400 hover:text-amber-300 underline font-black text-[11px]"
                        >
                          Google Maps ↗
                        </a>
                      </div>
                      <p className="text-[11px] text-zinc-300">
                        {settings.address}
                      </p>
                    </div>
                  )}

                  <input
                    type="text"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Special delivery notes (optional)"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Payment Selection */}
                <div className="pt-2">
                  <label className="text-[11px] font-bold text-zinc-400 block mb-1.5">
                    Select Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { id: 'Cash on Delivery', icon: Banknote, label: 'Cash on Delivery' },
                      { id: 'JazzCash', icon: Smartphone, label: 'JazzCash' },
                      { id: 'EasyPaisa', icon: Smartphone, label: 'EasyPaisa' },
                      { id: 'Online Card', icon: CreditCard, label: 'Debit/Credit Card' }
                    ].map((m) => {
                      const Icon = m.icon;
                      const isSelected = paymentMethod === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setPaymentMethod(m.id)}
                          className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                            isSelected
                              ? 'bg-amber-500/15 border-amber-500 text-amber-400 font-bold'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span className="text-[11px] truncate">{m.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Manual JazzCash / EasyPaisa Transfer Card */}
                  {(paymentMethod === 'JazzCash' || paymentMethod === 'EasyPaisa') && (
                    <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-amber-600/10 border border-amber-500/30 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-400 flex items-center gap-1.5">
                          <span>{paymentMethod} Official Account:</span>
                        </span>
                        <span className="text-[10px] bg-zinc-900 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30 font-semibold">
                          Manual Transfer
                        </span>
                      </div>

                      <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-zinc-500 uppercase font-semibold">
                            Title: <span className="text-zinc-200 font-bold">{settings.paymentAccounts?.[paymentMethod === 'JazzCash' ? 'jazzCash' : 'easyPaisa']?.title || 'Rab Razi Restaurant'}</span>
                          </div>
                          <div className="text-sm font-black text-amber-400 font-mono tracking-wider mt-0.5">
                            {settings.paymentAccounts?.[paymentMethod === 'JazzCash' ? 'jazzCash' : 'easyPaisa']?.number || '0300-9998877'}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopyAccount(settings.paymentAccounts?.[paymentMethod === 'JazzCash' ? 'jazzCash' : 'easyPaisa']?.number || '0300-9998877')}
                          className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer border border-zinc-700"
                        >
                          {copiedAccount ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-amber-400" />}
                          <span>{copiedAccount ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-300 block">
                          Transaction ID (TID) / Reference Number:
                        </label>
                        <input
                          type="text"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          placeholder="e.g. 1048291048 (from SMS or receipt)"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                        />
                        <p className="text-[10px] text-zinc-400">
                          Transfer Rs. {grandTotal.toLocaleString()} and enter TID above for instant kitchen approval.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Coverage Policy Card */}
              <div className="bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800/80 text-[11px] text-zinc-400 flex items-start gap-2.5">
                <Bike className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-zinc-200 font-bold block">Delivery Radius & Free Threshold:</span>
                  <span>{settings.deliveryRadiusText || 'Tando Bago City & Surrounding Areas (Within 5 km radius)'}. Orders above Rs. {settings.freeDeliveryThreshold || 1500} qualify for FREE delivery.</span>
                </div>
              </div>

              {/* Bill Breakdown */}
              <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800 space-y-2 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span className="font-semibold text-zinc-200">Rs. {cartSubtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-zinc-400">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-zinc-200">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-400 font-bold">FREE</span>
                    ) : (
                      `Rs. ${deliveryFee}`
                    )}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Discount</span>
                    <span>- Rs. {discountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-zinc-800 flex justify-between text-sm font-black text-white">
                  <span>Total Amount</span>
                  <span className="text-amber-400 text-base">Rs. {grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </>
          )}

        </div>

        {/* Drawer Footer with Both WhatsApp & In-App Checkout Options */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-zinc-800 bg-zinc-900/95 space-y-2">
            {/* Primary Action 1: Instant WhatsApp Order */}
            <button
              onClick={handleWhatsAppOrder}
              disabled={isCheckingOut}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 px-4 rounded-2xl shadow-xl shadow-emerald-950/50 flex items-center justify-between transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-white animate-pulse" />
                <span className="text-xs sm:text-sm">Order on WhatsApp 💬</span>
              </div>
              <span className="bg-emerald-950/60 border border-emerald-400/30 px-3 py-1 rounded-xl text-xs font-black">
                Rs. {grandTotal.toLocaleString()}
              </span>
            </button>

            {/* Primary Action 2: App Place Order */}
            <button
              onClick={handlePlaceOrder}
              disabled={isCheckingOut}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-bold py-2.5 px-4 rounded-2xl border border-zinc-700 flex items-center justify-between transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer text-xs"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                <span>{isCheckingOut ? 'Placing Order...' : 'Confirm & Place in App'}</span>
              </div>
              <span className="text-zinc-400 text-xs">
                Rs. {grandTotal.toLocaleString()}
              </span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
