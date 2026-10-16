# 🍗 Rab Razi Restaurant (رب راضی ریسٹورنٹ)

> **Taste of Blessing & Royal Hospitality**  
> Full-Stack Food Ordering, Kitchen Management & Live Foodpanda-Style Rider GPS Tracking Application.
> Built with **React.js & Tailwind CSS (Frontend)** and **Node.js & Express (Backend)**.

🌐 **Live Website:** [https://rab-razi-restaurant.vercel.app](https://rab-razi-restaurant.vercel.app)  
🛡️ **Admin Portal:** [https://rab-razi-restaurant.vercel.app/#admin](https://rab-razi-restaurant.vercel.app/#admin)  
🛵 **Rider GPS App:** [https://rab-razi-restaurant.vercel.app/#rider](https://rab-razi-restaurant.vercel.app/#rider)

---

## 🏗️ Architecture & Project Structure

The project is structured into clear `frontend` and `backend` directories:

```
rab-razi-restaurant/
├── frontend/                     # React.js & Tailwind CSS User Interface
│   ├── src/
│   │   ├── components/           # UI Components (Header, Cart, AuthModal, OrderTracking, Admin, Rider, etc.)
│   │   ├── context/              # AppContext & State Management
│   │   ├── services/             # API Client (authApi, ordersApi, menuApi)
│   │   └── data/                 # Mock & Initial data
│   ├── package.json
│   └── vite.config.js
│
├── backend/                      # Node.js & Express REST API
│   ├── controllers/              # authController, orderController, menuController
│   ├── routes/                   # authRoutes, orderRoutes, menuRoutes
│   ├── middleware/               # authMiddleware (JWT verification)
│   ├── data/                     # Persistent JSON storage (users.json, orders.json, menu.json)
│   ├── server.js                 # Express Server Entry Point
│   └── package.json
│
├── scripts/
│   └── dev.js                    # Cross-platform concurrent runner for frontend + backend
├── package.json                  # Root monorepo manager
└── vercel.json
```

---

## 👤 User Account & Authentication (Foodpanda-Style)

Users can create and manage their personal accounts just like on Foodpanda:
* **User Sign Up:** Full Name, Mobile Phone Number, Email, Password, and Delivery Address in Tando Bago.
* **User Log In:** Sign in using Email or Phone Number with JWT token-based authentication.
* **Dedicated Administrator:** Reserved strictly for `abraralimemon23@gmail.com` with auto-assigned Admin privileges.
* **User Profile & Saved Addresses:**
  * Manage multiple delivery locations (Home, Office, Shop).
  * Automatically pre-fills delivery details at checkout for 1-click ordering.
  * Access personal order history with instant live tracking links.
* **Seamless Offline / Cloud Fallback:** If the backend server is offline or deployed to static hosting, the frontend gracefully falls back to local authenticated state without breaking!

---

## ✨ Key Features

### 1. 📱 Customer Food App (`/`)
* **Responsive Mobile App Frame:** Fluid UI with optional mobile phone frame simulation mode.
* **Pakistani & Fast Food Menu:** Shinwari Karahi, White Handi, Charcoal BBQ, Matka Dum Biryani, Crispy Zingers, Roghni Naan, and Refreshing Drinks.
* **Custom Portions & Spices:** Half/Full selection, spice level adjustments (Mild, Medium, Hot), and special cooking instructions.
* **Deals & Bundles:** Special family feasts with countdown timers and promo voucher (`RAZI20` for 20% OFF).
* **Delivery & Pickup Modes:** Toggle between Home Delivery and Restaurant Takeaway/Pickup.
* **Smart Cart & Checkout:** Voucher applicator, delivery charges, customer address auto-fill, and payment methods (Cash on Delivery, JazzCash, EasyPaisa, Card).

### 2. 🛵 Foodpanda-Style Live Rider GPS Tracking (`#rider` & `Track Tab`)
* **Real Device GPS Sharing:** HTML5 Geolocation API (`watchPosition`) transmitting live rider coordinates.
* **Interactive SVG Route Map:** Dynamic distance remaining, live speed (km/h), and dynamic ETA countdown.
* **Contextual Stages:** Distinct UI & map states for `Pending Approval`, `Approved & Cooking in Kitchen`, `Out for Delivery`, and `Delivered`.

### 3. 🛡️ Admin Operations Portal (`#admin`)
* **Live Kitchen Queue:** Approve pending orders, advance stages, and assign riders.
* **Fleet Management:** Monitor riders and vehicle assignments.
* **Menu Management (CRUD):** Add, update, delete dishes and toggle stock status.

---

## 🚀 Running the Project

### 1. Run Both Frontend and Backend Concurrently:
```bash
npm run dev
```
* **Frontend:** `http://localhost:5173`
* **Backend API:** `http://localhost:5000`

### 2. Run Individually:
```bash
# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend
```

### 3. Build for Production:
```bash
npm run build
```
Builds the Vite frontend into `frontend/dist` and syncs with root `dist/` for zero-configuration hosting on Vercel.

---

## 📍 Restaurant Location
* **Location:** Tando Bago, Badin District, Sindh, Pakistan
* **Google Plus Code:** `QXQ6+C96` (`7JPCQXQ6+C96`)
* **Coordinates:** `24.7885° N, 68.9609° E`
* **Google Maps:** [Open in Google Maps](https://maps.app.goo.gl/j9TWCvYC6UaRACuf8)

---
© 2026 Rab Razi Restaurant. All rights reserved.
