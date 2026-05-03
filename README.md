# 🛒 Grozo — Smart Grocery Ordering & Management System

A full-stack MERN grocery platform inspired by Blinkit, Zepto & BigBasket with AI-powered features, real-time order tracking, and eco-friendly delivery options.

## ⚡ Quick Start

### Prerequisites
- **Node.js** v18+
- **MongoDB** (local or Atlas)
- **Git**

### Installation

```bash
# 1. Clone & install dependencies
cd Grozo
npm install
cd client && npm install && cd ..

# 2. Configure environment
# Edit .env with your MongoDB URI

# 3. Seed the database
npm run seed

# 4. Start development (both server + client)
npm run dev
```

### Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@grozo.com | admin123 |
| Customer | user@grozo.com | user123 |

## 🏗️ Architecture

```
Grozo/
├── server/                    # Express.js Backend
│   ├── config/                # Database & constants
│   ├── controllers/           # Auth, Products, Cart, Orders, Admin, Delivery
│   ├── middleware/             # JWT auth, error handling
│   ├── models/                # User, Product, Order, Cart, DeliveryAgent, Coupon, Review, DarkStore
│   ├── routes/                # RESTful API routes
│   ├── seeds/                 # Database seeder (30+ products)
│   ├── sockets/               # Socket.io real-time handlers
│   └── server.js
├── client/                    # React.js Frontend
│   └── src/
│       ├── api/               # Axios with interceptors
│       ├── components/        # Navbar, Footer, ProductCard
│       ├── context/           # Auth & Cart providers
│       ├── pages/             # Home, Products, Cart, Orders, Admin, etc.
│       └── styles/            # Design system CSS
└── .env
```

## 🎯 Features Implemented

### 🛍️ Customer Features
- ✅ User authentication (JWT + refresh tokens)
- ✅ Product browsing with search, filters, sorting
- ✅ Smart recommendations based on purchase history
- ✅ Shopping cart with quantity controls
- ✅ Coupon/discount system
- ✅ Order placement with multiple payment methods
- ✅ Real-time order tracking with visual timeline
- ✅ Order history & quick reorder
- ✅ Multiple delivery types (Instant/Scheduled/Eco)
- ✅ Smart basket optimization (cheaper alternatives)
- ✅ Spending insights & analytics
- ✅ Pantry management system
- ✅ Loyalty points & streak rewards

### ⚙️ Admin Features
- ✅ Dashboard with real-time stats
- ✅ Order management with status updates
- ✅ Product catalog management
- ✅ Sales analytics & top products
- ✅ Coupon management (percentage & flat)
- ✅ User management

### 🚚 Delivery Features
- ✅ Active order management
- ✅ Real-time location updates via Socket.io
- ✅ Earnings dashboard
- ✅ Online/offline toggle

### 💡 Innovative Features
- ✅ **Smart Basket Optimization** — Suggests cheaper alternatives
- ✅ **Predictive Auto-Replenishment** — Based on consumption patterns
- ✅ **Pantry Management** — Track what you have at home
- ✅ **Eco Delivery Mode** — Batch/EV delivery option
- ✅ **Gamification** — Loyalty points, streaks, rewards
- ✅ **Farm-to-Table** — Direct from farm marketplace
- ✅ **Smart Spending Insights** — Monthly analytics
- ✅ **Flash Deals** — Time-limited discounts
- ✅ **Dark Store System** — Hyperlocal inventory

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get profile |
| GET | /api/products | Browse products (with filters) |
| GET | /api/products/categories | Get categories |
| GET | /api/products/flash-deals | Flash deals |
| GET | /api/products/recommendations | AI recommendations |
| POST | /api/products/optimize-basket | Smart basket |
| GET/POST | /api/cart | Cart operations |
| POST | /api/orders/place | Place order |
| GET | /api/orders/my-orders | Order history |
| GET | /api/orders/spending-insights | Spending analytics |
| GET | /api/admin/dashboard | Admin overview |
| GET | /api/admin/analytics | Sales analytics |

## 📊 Database Models
- **Users** — Auth, addresses, wallet, loyalty, subscriptions, pantry
- **Products** — Categories, pricing, flash deals, farm details, nutrition
- **Orders** — Full lifecycle, tracking, ratings
- **Cart** — Items, coupons, saved for later
- **DeliveryAgent** — Location, earnings, rating
- **Coupon** — Percentage/flat, limits, categories
- **Review** — Ratings, verified purchase
- **DarkStore** — Location, inventory, metrics

## 🛠️ Tech Stack
- **Frontend:** React.js, React Router, Axios, Framer Motion, React Icons, Recharts
- **Backend:** Node.js, Express.js, Mongoose, JWT, Socket.io
- **Database:** MongoDB with geo-indexing
- **Real-time:** Socket.io for order tracking
- **Design:** Custom CSS design system with Inter & Space Grotesk fonts

## 📜 License
MIT — Built by Ashwajeet Singh
"# Grozo" 
