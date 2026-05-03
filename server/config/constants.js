module.exports = {
  ORDER_STATUS: {
    PLACED: 'placed',
    CONFIRMED: 'confirmed',
    PICKING: 'picking',
    PACKED: 'packed',
    DISPATCHED: 'dispatched',
    OUT_FOR_DELIVERY: 'out_for_delivery',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded'
  },
  PAYMENT_STATUS: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded'
  },
  PAYMENT_METHODS: ['card', 'upi', 'wallet', 'cod', 'netbanking'],
  USER_ROLES: {
    CUSTOMER: 'customer',
    ADMIN: 'admin',
    DELIVERY: 'delivery',
    DARK_STORE_MANAGER: 'dark_store_manager'
  },
  DELIVERY_TYPES: {
    INSTANT: 'instant',
    SCHEDULED: 'scheduled',
    ECO: 'eco'
  },
  VEHICLE_TYPES: ['bicycle', 'ev_bike', 'bike', 'van'],
  CATEGORIES: [
    'Fruits & Vegetables',
    'Dairy & Breakfast',
    'Snacks & Munchies',
    'Cold Drinks & Juices',
    'Instant & Frozen Food',
    'Tea, Coffee & Health Drink',
    'Bakery & Biscuits',
    'Sweet Tooth',
    'Atta, Rice & Dal',
    'Dry Fruits, Masala & Oil',
    'Sauces & Spreads',
    'Chicken, Meat & Fish',
    'Paan Corner',
    'Organic & Healthy Living',
    'Baby Care',
    'Pharma & Wellness',
    'Cleaning Essentials',
    'Home & Office',
    'Personal Care',
    'Pet Care'
  ],
  LOYALTY_POINTS: {
    PER_ORDER: 10,
    PER_100_SPENT: 5,
    REFERRAL_BONUS: 50,
    STREAK_BONUS: {
      3: 15,
      7: 30,
      14: 60,
      30: 150
    }
  }
};
