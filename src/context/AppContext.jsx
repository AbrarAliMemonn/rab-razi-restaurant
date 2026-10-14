import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { INITIAL_MENU_ITEMS, INITIAL_ORDERS, INITIAL_SETTINGS, INITIAL_RIDERS } from '../data/mockData';

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

  // Orders state
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('rrr_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed[0]?.customerAddress?.includes('Islamabad')) {
          localStorage.setItem('rrr_orders', JSON.stringify(INITIAL_ORDERS));
          return INITIAL_ORDERS;
        }
        return parsed;
      }
      return INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
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
        if (!parsed.googleMapsUrl || (parsed.address && parsed.address.includes('Islamabad'))) {
          const merged = { ...parsed, ...INITIAL_SETTINGS };
          localStorage.setItem('rrr_settings', JSON.stringify(merged));
          return merged;
        }
        return parsed;
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
      return saved || (INITIAL_ORDERS[0]?.id || null);
    } catch {
      return INITIAL_ORDERS[0]?.id || null;
    }
  });

  // Portal separation: 'user' | 'admin' | 'rider'
  const [portalMode, setPortalMode] = useState(() => {
    if (typeof window !== 'undefined') {
      if (window.location.hash === '#admin') return 'admin';
      if (window.location.hash === '#rider') return 'rider';
    }
    return 'user';
  });

  // Admin authentication state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    try {
      return localStorage.getItem('rrr_admin_auth') === 'true';
    } catch {
      return false;
    }
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

  // Sync hash with portalMode
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setPortalMode('admin');
      } else if (window.location.hash === '#rider') {
        setPortalMode('rider');
      } else {
        setPortalMode('user');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const switchToAdmin = () => {
    window.location.hash = 'admin';
    setPortalMode('admin');
  };

  const switchToRider = () => {
    window.location.hash = 'rider';
    setPortalMode('rider');
  };

  const switchToUser = () => {
    window.location.hash = '';
    setPortalMode('user');
  };

  const loginAdmin = (username, password) => {
    if ((username === 'admin' && password === 'admin123') || (username === 'admin' && password === '')) {
      setIsAdminAuthenticated(true);
      localStorage.setItem('rrr_admin_auth', 'true');
      showToast('Admin login successful! Welcome Manager.', 'success');
      return true;
    }
    showToast('Invalid admin credentials. Use admin / admin123', 'warning');
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('rrr_admin_auth');
    showToast('Admin logged out safely', 'info');
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
      customerName: orderData.customerName || 'Valued Guest',
      customerPhone: orderData.customerPhone || '0300-0000000',
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
