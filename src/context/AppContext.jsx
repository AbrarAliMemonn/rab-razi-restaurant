import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { INITIAL_MENU_ITEMS, INITIAL_ORDERS, INITIAL_SETTINGS, INITIAL_RIDERS } from '../data/mockData';
import { authApi, ordersApi } from '../services/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Menu items state
  const [menuItems, setMenuItems] = useState(() => {
    try {
      const saved = localStorage.getItem('rrr_menu');
      return saved ? JSON.parse(saved) : INITIAL_MENU_ITEMS;
    } catch {
      return INITIAL_MENU_ITEMS;
    }
  });

  // Orders state (Starts empty; no demo orders for fresh users)
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('rrr_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        const cleaned = parsed.filter(
          (o) => o.id !== 'RRR-7821' && o.id !== 'RRR-6534' && o.id !== 'RRR-5109' && !o.customerAddress?.includes('Islamabad')
        );
        localStorage.setItem('rrr_orders', JSON.stringify(cleaned));
        return cleaned;
      }
      return [];
    } catch {
      return [];
    }
  });

  // Riders state
  const [riders, setRiders] = useState(() => {
    try {
      const saved = localStorage.getItem('rrr_riders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed[0]?.bike?.includes('ICT')) {
          localStorage.setItem('rrr_riders', JSON.stringify(INITIAL_RIDERS));
          return INITIAL_RIDERS;
        }
        return parsed;
      }
      return INITIAL_RIDERS;
    } catch {
      return INITIAL_RIDERS;
    }
  });

  // Restaurant settings (Self-healing to Tando Bago location)
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('rrr_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        const merged = { ...INITIAL_SETTINGS, ...parsed };
        if (!parsed.googleMapsUrl || (parsed.address && parsed.address.includes('Islamabad')) || !parsed.whatsappRaw) {
          localStorage.setItem('rrr_settings', JSON.stringify(merged));
        }
        return merged;
      }
      return INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // Cart state
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('rrr_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Active tracked order ID
  const [activeOrderId, setActiveOrderId] = useState(() => {
    try {
      const saved = localStorage.getItem('rrr_active_order');
      if (saved && (saved === 'RRR-7821' || saved === 'RRR-6534' || saved === 'RRR-5109')) {
        localStorage.removeItem('rrr_active_order');
        return null;
      }
      return saved || null;
    } catch {
      return null;
    }
  });

  // Portal separation: 'user' | 'admin' | 'rider'
  const [portalMode, setPortalMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname.toLowerCase().replace(/\/+$/, '');
      const hash = window.location.hash.toLowerCase();
      if (pathname === '/admin' || hash === '#admin') return 'admin';
      if (pathname === '/rider' || hash === '#rider') return 'rider';
    }
    return 'user';
  });



  // Live GPS Coordinates of Rider (Foodpanda live tracking in Tando Bago: 24.788538, 68.960891)
  const [riderLiveLocation, setRiderLiveLocation] = useState(() => {
    try {
      const saved = localStorage.getItem('rrr_rider_live_location');
      return saved ? JSON.parse(saved) : {
        lat: 24.788538,
        lng: 68.960891,
        progress: 42,
        speed: 34,
        distanceRemaining: '1.1 km',
        etaMinutes: 4,
        accuracy: 5,
        lastPing: new Date().toLocaleTimeString(),
        isBroadcasting: true
      };
    } catch {
      return {
        lat: 24.788538,
        lng: 68.960891,
        progress: 42,
        speed: 34,
        distanceRemaining: '1.1 km',
        etaMinutes: 4,
        accuracy: 5,
        lastPing: new Date().toLocaleTimeString(),
        isBroadcasting: true
      };
    }
  });

  // Listen to cross-window BroadcastChannel and Storage changes for Live Orders & GPS
  useEffect(() => {
    let gpsBc = null;
    let ordersBc = null;

    try {
      gpsBc = new BroadcastChannel('rab_razi_gps_feed');
      gpsBc.onmessage = (event) => {
        if (event.data) {
          setRiderLiveLocation(event.data);
        }
      };
    } catch {
      // fallback
    }

    try {
      ordersBc = new BroadcastChannel('rab_razi_orders_feed');
      ordersBc.onmessage = (event) => {
        if (event.data && event.data.type === 'ORDERS_UPDATED') {
          setOrders(event.data.orders);
          if (event.data.message) {
            showToast(event.data.message, event.data.msgType || 'info');
          }
        }
      };
    } catch {
      // fallback
    }

    const handleStorage = (e) => {
      if (e.key === 'rrr_rider_live_location' && e.newValue) {
        try {
          setRiderLiveLocation(JSON.parse(e.newValue));
        } catch {
          // ignore
        }
      }
      if (e.key === 'rrr_orders' && e.newValue) {
        try {
          setOrders(JSON.parse(e.newValue));
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      if (gpsBc) gpsBc.close();
      if (ordersBc) ordersBc.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Sync pathname & hash with portalMode (supports /admin, /rider, #admin, browser back/forward)
  useEffect(() => {
    const handleNavigation = () => {
      const pathname = window.location.pathname.toLowerCase().replace(/\/+$/, '');
      const hash = window.location.hash.toLowerCase();
      if (pathname === '/admin' || hash === '#admin') {
        setPortalMode('admin');
      } else if (pathname === '/rider' || hash === '#rider') {
        setPortalMode('rider');
      } else {
        setPortalMode('user');
      }
    };

    window.addEventListener('popstate', handleNavigation);
    window.addEventListener('hashchange', handleNavigation);
    return () => {
      window.removeEventListener('popstate', handleNavigation);
      window.removeEventListener('hashchange', handleNavigation);
    };
  }, []);

  const switchToAdmin = () => {
    try {
      window.history.pushState(null, '', '/admin');
    } catch {
      window.location.hash = 'admin';
    }
    setPortalMode('admin');
  };

  const switchToRider = () => {
    try {
      window.history.pushState(null, '', '/rider');
    } catch {
      window.location.hash = 'rider';
    }
    setPortalMode('rider');
  };

  const switchToUser = () => {
    try {
      window.history.pushState(null, '', '/');
    } catch {
      window.location.hash = '';
    }
    setPortalMode('user');
  };



  // User panel navigation states
  const [currentTab, setCurrentTab] = useState('home'); // 'home' | 'menu' | 'deals' | 'tracking'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deliveryMode, setDeliveryMode] = useState('delivery'); // 'delivery' | 'pickup'
  const [userLocation, setUserLocation] = useState('Tando Bago, Sindh');
  const [isMobileFrameMode, setIsMobileFrameMode] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedItemForModal, setSelectedItemForModal] = useState(null);

  // Foodpanda-style User Authentication state
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('rrr_current_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [authToken, setAuthToken] = useState(() => {
    return localStorage.getItem('rrr_auth_token') || null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'register'
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Auto-sync user address to userLocation if available
  useEffect(() => {
    if (currentUser?.addresses?.length > 0) {
      const def = currentUser.addresses.find((a) => a.isDefault) || currentUser.addresses[0];
      if (def?.address) {
        setUserLocation(def.address);
      }
    }
  }, [currentUser]);

  // Auto-verify token with backend on mount
  useEffect(() => {
    if (authToken) {
      authApi.getMe().then((res) => {
        if (res.ok && res.data?.user) {
          setCurrentUser(res.data.user);
          localStorage.setItem('rrr_current_user', JSON.stringify(res.data.user));
        }
      });
    }
  }, [authToken]);

  // Derived Admin authentication status (requires authenticated user with role 'admin' & valid token)
  const isAdminAuthenticated = Boolean(
    currentUser && currentUser.role === 'admin' && authToken
  );

  // Derived Rider authentication status (requires authenticated user with role 'rider' or 'admin' & valid token)
  const isRiderAuthenticated = Boolean(
    currentUser && (currentUser.role === 'rider' || currentUser.role === 'admin') && authToken
  );

  // Multi-device real-time orders synchronization from backend API
  const refreshOrders = async () => {
    try {
      const res = await ordersApi.getAll();
      if (res.ok && res.data?.orders) {
        setOrders(res.data.orders);
        localStorage.setItem('rrr_orders', JSON.stringify(res.data.orders));
      }
    } catch {
      // offline / fallback
    }
  };

  useEffect(() => {
    refreshOrders();
    const interval = setInterval(refreshOrders, 15000);
    return () => clearInterval(interval);
  }, [authToken]);

  // Scope active tracked order to the active user
  const syncUserActiveOrder = (user) => {
    if (!user) {
      setActiveOrderId(null);
      localStorage.removeItem('rrr_active_order');
      return;
    }
    const userRunningOrder = orders.find(
      (o) =>
        ((o.userId && o.userId === user.id) ||
         (o.customerEmail && user.email && o.customerEmail.toLowerCase() === user.email.toLowerCase()) ||
         (o.customerPhone && user.phone && o.customerPhone === user.phone)) &&
        (o.status === 'pending' || o.status === 'preparing' || o.status === 'on_the_way')
    );
    if (userRunningOrder) {
      setActiveOrderId(userRunningOrder.id);
    } else {
      setActiveOrderId(null);
      localStorage.removeItem('rrr_active_order');
    }
  };

  const loginUser = async (identifier, password) => {
    const res = await authApi.login(identifier, password);
    if (res.ok && res.data?.success) {
      const { user, token } = res.data;
      setCurrentUser(user);
      setAuthToken(token);
      localStorage.setItem('rrr_current_user', JSON.stringify(user));
      localStorage.setItem('rrr_auth_token', token);
      syncUserActiveOrder(user);
      setIsAuthModalOpen(false);
      showToast(`Welcome back, ${user.name}! 👋`, 'success');
      return { success: true, user };
    }

    // Offline / LocalStorage fallback (Validates against stored user accounts without plain-text bypasses)
    if (res.isOffline) {
      const localUsers = JSON.parse(localStorage.getItem('rrr_local_users') || '[]');
      const cleanId = identifier.trim().toLowerCase();

      const found = localUsers.find(
        (u) => (u.email?.toLowerCase() === cleanId || u.phone === identifier.trim()) && u.password === password
      );

      if (found) {
        const { password: _, ...safeUser } = found;
        setCurrentUser(safeUser);
        setAuthToken(`mock_token_${safeUser.id}`);
        localStorage.setItem('rrr_current_user', JSON.stringify(safeUser));
        localStorage.setItem('rrr_auth_token', `mock_token_${safeUser.id}`);
        syncUserActiveOrder(safeUser);
        setIsAuthModalOpen(false);
        showToast(`Welcome back, ${safeUser.name}!`, 'success');
        return { success: true, user: safeUser };
      }

      return { success: false, message: 'Invalid email/phone or password.' };
    }

    return { success: false, message: res.data?.message || 'Login failed.' };
  };

  // Dedicated Admin Login via backend authentication with role verification
  const loginAdmin = async (identifier, password) => {
    const res = await loginUser(identifier, password);
    if (res.success && res.user) {
      if (res.user.role === 'admin') {
        showToast(`Welcome Admin ${res.user.name}! 👑`, 'success');
        return { success: true, user: res.user };
      } else {
        showToast('Access Denied: This account does not have Admin privileges.', 'warning');
        return { success: false, message: 'Admin role privileges required.' };
      }
    }
    return res;
  };

  const logoutAdmin = () => {
    logoutUser();
    showToast('Admin logged out safely', 'info');
  };

  // Dedicated Rider Login via backend authentication with role verification
  const loginRider = async (identifier, password) => {
    const res = await loginUser(identifier, password);
    if (res.success && res.user) {
      if (res.user.role === 'rider' || res.user.role === 'admin') {
        showToast(`Welcome Rider ${res.user.name}! 🛵`, 'success');
        return { success: true, user: res.user };
      } else {
        showToast('Access Denied: Rider or Admin credentials required.', 'warning');
        return { success: false, message: 'Rider privileges required.' };
      }
    }
    return res;
  };

  const logoutRider = () => {
    logoutUser();
    showToast('Rider logged out safely', 'info');
  };

  const registerUser = async (userData) => {
    const res = await authApi.register(userData);
    if (res.ok && res.data?.success) {
      const { user, token } = res.data;
      setCurrentUser(user);
      setAuthToken(token);
      localStorage.setItem('rrr_current_user', JSON.stringify(user));
      localStorage.setItem('rrr_auth_token', token);
      setActiveOrderId(null);
      localStorage.removeItem('rrr_active_order');
      setIsAuthModalOpen(false);
      showToast(`Welcome to Rab Razi Restaurant, ${user.name}! 🎉`, 'success');
      return { success: true, user };
    }

    // Offline / LocalStorage fallback (Strictly registers customer role)
    if (res.isOffline) {
      const localUsers = JSON.parse(localStorage.getItem('rrr_local_users') || '[]');
      const newUserId = `usr-${Date.now().toString().slice(-6)}`;
      const cleanEmail = userData.email ? userData.email.trim().toLowerCase() : '';

      const newUser = {
        id: newUserId,
        name: userData.name.trim(),
        email: cleanEmail,
        phone: userData.phone ? userData.phone.trim() : '',
        password: userData.password,
        role: 'customer',
        addresses: userData.address ? [
          { id: `addr-${Date.now()}`, label: 'Home', address: userData.address.trim(), isDefault: true }
        ] : []
      };

      localUsers.push(newUser);
      localStorage.setItem('rrr_local_users', JSON.stringify(localUsers));

      const { password: _, ...safeUser } = newUser;
      setCurrentUser(safeUser);
      setAuthToken(`mock_token_${safeUser.id}`);
      localStorage.setItem('rrr_current_user', JSON.stringify(safeUser));
      localStorage.setItem('rrr_auth_token', `mock_token_${safeUser.id}`);
      setActiveOrderId(null);
      localStorage.removeItem('rrr_active_order');
      setIsAuthModalOpen(false);
      showToast(`Account created successfully! Welcome ${safeUser.name}!`, 'success');
      return { success: true, user: safeUser };
    }

    return { success: false, message: res.data?.message || 'Registration failed.' };
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setAuthToken(null);
    setActiveOrderId(null);
    localStorage.removeItem('rrr_current_user');
    localStorage.removeItem('rrr_auth_token');
    localStorage.removeItem('rrr_active_order');
    setIsProfileModalOpen(false);
    showToast('Logged out safely', 'info');
  };

  const addUserAddress = async (addressData) => {
    if (!currentUser) return;

    const newAddr = {
      id: `addr-${Date.now()}`,
      label: addressData.label || 'Delivery Address',
      address: addressData.address,
      isDefault: addressData.isDefault || false
    };

    const updatedAddresses = [...(currentUser.addresses || []), newAddr];
    const updatedUser = { ...currentUser, addresses: updatedAddresses };
    setCurrentUser(updatedUser);
    localStorage.setItem('rrr_current_user', JSON.stringify(updatedUser));

    // Try backend update
    authApi.addAddress(addressData);
  };

  // Floating toast notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  // Sync states to LocalStorage
  useEffect(() => {
    localStorage.setItem('rrr_menu', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('rrr_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('rrr_riders', JSON.stringify(riders));
  }, [riders]);

  useEffect(() => {
    localStorage.setItem('rrr_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('rrr_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (activeOrderId) {
      localStorage.setItem('rrr_active_order', activeOrderId);
    } else {
      localStorage.removeItem('rrr_active_order');
    }
  }, [activeOrderId]);

  // Cart operations
  const addToCart = (item, options = {}, quantity = 1) => {
    const itemKey = `${item.id}-${options.portion || 'std'}-${options.spice || 'std'}`;
    const extraPrice = options.extraPrice || 0;
    const finalPrice = item.price + extraPrice;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((ci) => ci.cartKey === itemKey);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prevCart,
          {
            cartKey: itemKey,
            id: item.id,
            name: item.name,
            price: finalPrice,
            image: item.image,
            category: item.category,
            quantity,
            portion: options.portion || null,
            spice: options.spice || null,
            note: options.note || ''
          }
        ];
      }
    });

    showToast(`Added "${item.name}" to cart! 🛒`);
  };

  const removeFromCart = (cartKey) => {
    setCart((prev) => prev.filter((item) => item.cartKey !== cartKey));
    showToast('Item removed from cart', 'info');
  };

  const updateCartQuantity = (cartKey, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartKey === cartKey) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Helper to broadcast orders changes across all tabs/devices
  const broadcastOrders = (updatedOrders, message = null, msgType = 'info') => {
    try {
      const bc = new BroadcastChannel('rab_razi_orders_feed');
      bc.postMessage({ type: 'ORDERS_UPDATED', orders: updatedOrders, message, msgType });
      bc.close();
    } catch {
      // ignore
    }
  };

  // Place order from Customer Panel
  const placeOrder = (orderData) => {
    const newOrderId = `RRR-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();

    const availableRider = riders.find((r) => r.status === 'available') || riders[0];

    const newOrder = {
      id: newOrderId,
      userId: currentUser ? currentUser.id : null,
      customerEmail: currentUser?.email || '',
      customerName: orderData.customerName || (currentUser ? currentUser.name : 'Valued Guest'),
      customerPhone: orderData.customerPhone || (currentUser ? currentUser.phone : '0300-0000000'),
      customerAddress: orderData.customerAddress || userLocation,
      deliveryType: deliveryMode === 'delivery' ? 'Delivery' : deliveryMode === 'pickup' ? 'Takeaway' : 'Dine In',
      paymentMethod: orderData.paymentMethod || 'Cash on Delivery',
      notes: orderData.notes || '',
      items: cart.map((i) => ({
        id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        portion: i.portion,
        spice: i.spice
      })),
      subtotal: orderData.subtotal,
      deliveryFee: orderData.deliveryFee,
      discount: orderData.discount || 0,
      total: orderData.total,
      status: 'pending', // Order pending approval from admin/kitchen
      riderName: availableRider ? availableRider.name : 'Farhan Tariq (Rider #14)',
      riderPhone: availableRider ? availableRider.phone : '0312-9876543',
      riderBike: availableRider ? availableRider.bike : 'Honda CG 125 (BDN-992)',
      estimatedMinutes: deliveryMode === 'delivery' ? 35 : 20,
      createdAt: now.toISOString(),
      statusTimestamps: {
        pending: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    };

    setOrders((prev) => {
      const updated = [newOrder, ...prev];
      localStorage.setItem('rrr_orders', JSON.stringify(updated));
      broadcastOrders(updated, `Naya Order #${newOrderId} receive hua! Pending approval.`, 'info');
      return updated;
    });

    setActiveOrderId(newOrderId);
    clearCart();
    setIsCartOpen(false);

    // 🎯 USER WAPIS APNY MENU PE AA JAYE
    setCurrentTab('menu');

    // Sync order with backend
    try {
      ordersApi.create(newOrder);
    } catch {
      // safe fallback
    }

    // Confetti celebration
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // safe fallback
    }

    showToast(`Order #${newOrderId} Confirmed! Status: Pending Approval ⏳`, 'success');
    return newOrderId;
  };

  // Admin: Update order status (Approve to Preparing, Dispatch, etc.)
  const updateOrderStatus = (orderId, newStatus) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setOrders((prev) => {
      const updated = prev.map((order) => {
        if (order.id === orderId) {
          const updatedTimestamps = {
            ...order.statusTimestamps,
            [newStatus]: now
          };

          return {
            ...order,
            status: newStatus,
            statusTimestamps: updatedTimestamps
          };
        }
        return order;
      });

      localStorage.setItem('rrr_orders', JSON.stringify(updated));

      const customerBroadcastMsg =
        newStatus === 'preparing'
          ? `🍳 Order #${orderId} Approved! Kitchen me pakna shuru ho gaya hai (Preparing)`
          : newStatus === 'on_the_way'
          ? `🛵 Order #${orderId} Dispatched! Rider on the way.`
          : newStatus === 'delivered'
          ? `✓ Order #${orderId} Delivered!`
          : null;

      broadcastOrders(updated, customerBroadcastMsg, newStatus === 'preparing' ? 'success' : 'info');
      return updated;
    });

    if (newStatus === 'preparing') {
      showToast(`Order #${orderId} approved! User ko 'Preparing' show hoga 🍳`, 'success');
    } else {
      showToast(`Order ${orderId} status changed to "${newStatus.replace('_', ' ').toUpperCase()}"`, 'info');
    }
  };

  // Admin: Assign specific Rider to Order
  const assignRiderToOrder = (orderId, riderId) => {
    const rider = riders.find((r) => r.id === riderId);
    if (!rider) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: ord.status === 'pending' || ord.status === 'preparing' ? 'on_the_way' : ord.status,
            riderName: rider.name,
            riderPhone: rider.phone,
            riderBike: rider.bike,
            statusTimestamps: {
              ...ord.statusTimestamps,
              on_the_way: ord.statusTimestamps?.on_the_way || now
            }
          };
        }
        return ord;
      })
    );

    // Update rider's status
    setRiders((prev) =>
      prev.map((r) =>
        r.id === riderId
          ? {
              ...r,
              status: 'on_delivery',
              totalDeliveries: (r.totalDeliveries || 0) + 1
            }
          : r
      )
    );

    showToast(`Order #${orderId} assigned to ${rider.name}! 🛵`, 'success');
  };

  // Admin: Rider Management Functions
  const addRider = (riderData) => {
    const newRider = {
      id: `rider-${Date.now()}`,
      name: riderData.name.trim(),
      phone: riderData.phone.trim(),
      bike: riderData.bike.trim() || 'Honda CG 125',
      status: riderData.status || 'available',
      totalDeliveries: 0,
      rating: 5.0,
      joinedDate: new Date().toISOString().split('T')[0]
    };

    setRiders((prev) => [newRider, ...prev]);
    showToast(`Rider "${newRider.name}" added to delivery fleet! 🛵`);
  };

  const updateRider = (updatedRider) => {
    setRiders((prev) => prev.map((r) => (r.id === updatedRider.id ? { ...r, ...updatedRider } : r)));
    showToast('Rider profile updated!');
  };

  const deleteRider = (riderId) => {
    setRiders((prev) => prev.filter((r) => r.id !== riderId));
    showToast('Rider removed from fleet', 'warning');
  };

  const toggleRiderStatus = (riderId) => {
    setRiders((prev) =>
      prev.map((r) => {
        if (r.id === riderId) {
          const nextStatus = r.status === 'available' ? 'off_duty' : 'available';
          showToast(`${r.name} is now ${nextStatus === 'available' ? 'On Duty (Available)' : 'Off Duty'}`);
          return { ...r, status: nextStatus };
        }
        return r;
      })
    );
  };

  // Admin: Menu Item Management
  const addMenuItem = (itemData) => {
    const newItem = {
      ...itemData,
      id: `item-${Date.now()}`,
      rating: 5.0,
      reviewsCount: 1,
      inStock: true
    };
    setMenuItems((prev) => [newItem, ...prev]);
    showToast(`"${newItem.name}" added to menu! 🍲`);
  };

  const updateMenuItem = (updatedItem) => {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? { ...item, ...updatedItem } : item))
    );
    showToast(`Item updated successfully!`);
  };

  const deleteMenuItem = (itemId) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== itemId));
    showToast('Menu item deleted', 'warning');
  };

  const toggleItemStock = (itemId) => {
    setMenuItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const nextStock = !item.inStock;
          showToast(`${item.name} is now ${nextStock ? 'Available' : 'Out of Stock'}`);
          return { ...item, inStock: nextStock };
        }
        return item;
      })
    );
  };

  // Admin: Update settings
  const updateSettings = (newSettings) => {
    setSettings(newSettings);
    showToast('Restaurant settings updated!');
  };

  return (
    <AppContext.Provider
      value={{
        portalMode,
        setPortalMode,
        switchToAdmin,
        switchToRider,
        switchToUser,
        isAdminAuthenticated,
        loginAdmin,
        logoutAdmin,
        isRiderAuthenticated,
        loginRider,
        logoutRider,
        refreshOrders,
        riderLiveLocation,
        setRiderLiveLocation,
        menuItems,
        orders,
        riders,
        addRider,
        updateRider,
        deleteRider,
        toggleRiderStatus,
        assignRiderToOrder,
        settings,
        currentUser,
        setCurrentUser,
        authToken,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        isProfileModalOpen,
        setIsProfileModalOpen,
        loginUser,
        registerUser,
        logoutUser,
        addUserAddress,
        cart,
        activeOrderId,
        setActiveOrderId,
        currentTab,
        setCurrentTab,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        deliveryMode,
        setDeliveryMode,
        userLocation,
        setUserLocation,
        isMobileFrameMode,
        setIsMobileFrameMode,
        isCartOpen,
        setIsCartOpen,
        selectedItemForModal,
        setSelectedItemForModal,
        toast,
        showToast,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotalCount,
        cartSubtotal,
        placeOrder,
        updateOrderStatus,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleItemStock,
        updateSettings
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
