# 🍗 Rab Razi Restaurant (رب راضی ریسٹورنٹ)

> **Taste of Blessing & Royal Hospitality**  
> Modern, mobile-first responsive Food Ordering, Kitchen Management & Live Foodpanda-Style Rider GPS Tracking Web Application.

---

## 📍 Restaurant Location
* **Location:** Tando Bago, Badin District, Sindh, Pakistan
* **Google Plus Code:** `QXQ6+C96` (`7JPCQXQ6+C96`)
* **Coordinates:** `24.7885° N, 68.9609° E`
* **Google Maps:** [Open in Google Maps](https://maps.app.goo.gl/j9TWCvYC6UaRACuf8)

---

## ✨ Key Features

### 1. 📱 Customer Food App (`/`)
* **App-Like Mobile Layout:** Responsive fluid interface with toggleable Mobile Phone Frame simulator mode.
* **Complete Pakistani & Fast Food Menu:** Shinwari Karahi, White Handi, Charcoal BBQ, Matka Dum Biryani, Crispy Zingers, Roghni Naan, and Refreshing Beverages.
* **Custom Portion & Spice Selector:** Half/Full portion selection, Mild/Medium/Hot spice level adjustments, and kitchen notes.
* **Deals & Bundles:** Timed bundle offers with live countdown timers and promo voucher (`RAZI20` for 20% OFF).
* **Delivery & Pickup:** Smooth switching between Home Delivery and Restaurant Takeaway/Pickup.
* **Cart & Checkout Drawer:** Instant voucher applicator, delivery charges calculation, customer details, and payment options (Cash on Delivery, JazzCash, EasyPaisa, Debit/Credit Card).

### 2. 🛵 Foodpanda-Style Live Rider GPS Tracking (`#rider` & `Track Tab`)
* **Real Device GPS Sharing:** HTML5 Geolocation API (`watchPosition`) transmitting exact rider coordinates.
* **Live Ride Movement Demo:** 1-click auto-drive simulation showing the rider's bike moving in real time along the road.
* **Interactive Glowing SVG Route Map:** Real-time distance remaining, live speed (km/h), and dynamic ETA countdown.
* **Zero-Latency Cross-Device Sync:** Synchronized via `BroadcastChannel` and reactive local storage across multiple browser tabs and connected mobile phones on the local network.
* **Rider Contact Card:** Direct phone call button and bike vehicle details.

### 3. 🛡️ Admin Operations Management Portal (`#admin`)
* **Secure Manager Login:** Easy access credentials (`admin` / `admin123`).
* **Interactive Live Order Stepper:** 1-click status transitions (`Send to Kitchen 🍳`, `Dispatch Rider 🛵`, `Mark Delivered ✓`).
* **Delivery Fleet Management:** Register riders, monitor duty status (Available / On Delivery / Offline), and assign riders to live orders.
* **Menu Management (CRUD):** Add, update, delete dishes, toggle in-stock/out-of-stock, with preset Pakistani food photography.
* **Store Settings:** Live restaurant open/close toggle, delivery fee configuration, free delivery limits, and announcement banner editor.

---

## 🛠️ Tech Stack
* **Frontend:** React 19, JavaScript (ES Modules)
* **Build Tool:** Vite 8
* **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`)
* **Icons:** Lucide React
* **Effects:** Canvas Confetti

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v18 or newer)
* npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/AbrarAliMemonn/rab-razi-restaurant.git

# Navigate to project directory
cd rab-razi-restaurant

# Install dependencies
npm install

# Start development server
npm run dev
```

### URLs
* **Customer App:** `http://localhost:5173/`
* **Admin Portal:** `http://localhost:5173/#admin`
* **Rider GPS App:** `http://localhost:5173/#rider`

---

## 📄 License
This project is proprietary software created for **Rab Razi Restaurant, Tando Bago**. All rights reserved.
