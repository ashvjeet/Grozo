require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const DarkStore = require('../models/DarkStore');

const products = [
  // Fruits & Vegetables
  { name: 'Fresh Bananas', description: 'Ripe yellow bananas, rich in potassium and great for smoothies', category: 'Fruits & Vegetables', subcategory: 'Fresh Fruits', brand: 'Farm Fresh', price: 40, mrp: 55, unit: '1 dozen', weight: '1 kg', stock: 500, tags: ['fruit', 'banana', 'healthy'], isOrganic: false, images: [{ url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400', alt: 'Bananas' }], nutritionInfo: { calories: 89, protein: '1.1g', carbs: '22.8g', fat: '0.3g', fiber: '2.6g' } },
  { name: 'Organic Tomatoes', description: 'Firm, red tomatoes perfect for salads and cooking', category: 'Fruits & Vegetables', subcategory: 'Fresh Vegetables', brand: 'Organic India', price: 35, mrp: 45, unit: '500g', weight: '500g', stock: 300, tags: ['vegetable', 'tomato', 'organic'], isOrganic: true, isFarmDirect: true, images: [{ url: 'https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=400', alt: 'Tomatoes' }] },
  { name: 'Fresh Spinach', description: 'Crisp green spinach leaves, packed with iron and vitamins', category: 'Fruits & Vegetables', subcategory: 'Fresh Vegetables', brand: 'Green Valley', price: 25, mrp: 35, unit: '250g', weight: '250g', stock: 200, tags: ['vegetable', 'spinach', 'healthy', 'iron'], isOrganic: true, images: [{ url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400', alt: 'Spinach' }] },
  { name: 'Red Apples', description: 'Sweet and crunchy Shimla apples', category: 'Fruits & Vegetables', subcategory: 'Fresh Fruits', brand: 'Himalayan Fresh', price: 120, mrp: 160, unit: '1 kg', weight: '1 kg', stock: 400, tags: ['fruit', 'apple', 'healthy'], images: [{ url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400', alt: 'Apples' }] },
  { name: 'Fresh Onions', description: 'Premium quality onions for everyday cooking', category: 'Fruits & Vegetables', subcategory: 'Fresh Vegetables', brand: 'Farm Fresh', price: 30, mrp: 40, unit: '1 kg', weight: '1 kg', stock: 600, tags: ['vegetable', 'onion', 'essential'], images: [{ url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400', alt: 'Onions' }] },
  { name: 'Potatoes', description: 'Fresh potatoes ideal for all Indian dishes', category: 'Fruits & Vegetables', subcategory: 'Fresh Vegetables', brand: 'Farm Fresh', price: 28, mrp: 35, unit: '1 kg', weight: '1 kg', stock: 700, tags: ['vegetable', 'potato', 'essential'], images: [{ url: 'https://images.unsplash.com/photo-1518977676601-b28d4c43edf3?w=400', alt: 'Potatoes' }] },
  // Dairy & Breakfast
  { name: 'Amul Toned Milk', description: 'Pasteurized toned milk, rich in calcium', category: 'Dairy & Breakfast', subcategory: 'Milk', brand: 'Amul', price: 29, mrp: 29, unit: '500 ml', weight: '500 ml', stock: 1000, tags: ['milk', 'dairy', 'daily'], images: [{ url: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400', alt: 'Milk' }] },
  { name: 'White Bread', description: 'Soft white bread for sandwiches and toast', category: 'Dairy & Breakfast', subcategory: 'Bread', brand: 'Britannia', price: 40, mrp: 45, unit: '400g', weight: '400g', stock: 300, tags: ['bread', 'breakfast', 'daily'], images: [{ url: 'https://images.unsplash.com/photo-1549931319-a545753467c8?w=400', alt: 'White Bread' }] },
  { name: 'Farm Eggs', description: 'Fresh farm eggs, protein packed', category: 'Dairy & Breakfast', subcategory: 'Eggs', brand: 'Country Delight', price: 72, mrp: 85, unit: '6 pcs', weight: '6 pcs', stock: 400, tags: ['eggs', 'protein', 'breakfast'], images: [{ url: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400', alt: 'Eggs' }] },
  { name: 'Greek Yogurt', description: 'Creamy greek yogurt, high in protein', category: 'Dairy & Breakfast', subcategory: 'Yogurt', brand: 'Epigamia', price: 65, mrp: 80, unit: '200g', weight: '200g', stock: 200, tags: ['yogurt', 'protein', 'healthy'], images: [{ url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400', alt: 'Yogurt' }] },
  { name: 'Paneer', description: 'Fresh cottage cheese, soft and creamy', category: 'Dairy & Breakfast', subcategory: 'Paneer & Tofu', brand: 'Amul', price: 90, mrp: 100, unit: '200g', weight: '200g', stock: 250, tags: ['paneer', 'protein', 'indian'], images: [{ url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400', alt: 'Paneer' }] },
  // Snacks & Munchies
  { name: 'Lay\'s Classic Salted', description: 'Crispy potato chips with the perfect salt', category: 'Snacks & Munchies', subcategory: 'Chips', brand: 'Lay\'s', price: 20, mrp: 20, unit: '52g', weight: '52g', stock: 500, tags: ['chips', 'snacks', 'party'], images: [{ url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400', alt: 'Chips' }] },
  { name: 'Mixed Dry Fruits', description: 'Premium assorted dry fruits - almonds, cashews, raisins', category: 'Snacks & Munchies', subcategory: 'Dry Fruits', brand: 'Nutraj', price: 299, mrp: 399, unit: '250g', weight: '250g', stock: 150, tags: ['dry fruits', 'healthy', 'premium'], isOrganic: true, images: [{ url: 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=400', alt: 'Dry Fruits' }] },
  // Cold Drinks & Juices
  { name: 'Real Mango Juice', description: 'Made from real Alphonso mangoes, no added preservatives', category: 'Cold Drinks & Juices', subcategory: 'Juices', brand: 'Real', price: 99, mrp: 120, unit: '1L', weight: '1L', stock: 300, tags: ['juice', 'mango', 'drink'], images: [{ url: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400', alt: 'Mango Juice' }] },
  { name: 'Coca Cola', description: 'Refreshing carbonated drink', category: 'Cold Drinks & Juices', subcategory: 'Soft Drinks', brand: 'Coca Cola', price: 40, mrp: 40, unit: '750 ml', weight: '750 ml', stock: 400, tags: ['cola', 'drink', 'refreshing'], images: [{ url: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400', alt: 'Cola' }] },
  // Atta, Rice & Dal
  { name: 'Aashirvaad Atta', description: 'Whole wheat flour for soft rotis', category: 'Atta, Rice & Dal', subcategory: 'Atta & Flour', brand: 'Aashirvaad', price: 265, mrp: 310, unit: '5 kg', weight: '5 kg', stock: 200, tags: ['atta', 'wheat', 'essential'], images: [{ url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400', alt: 'Atta' }] },
  { name: 'India Gate Basmati Rice', description: 'Premium aged basmati rice with aromatic flavor', category: 'Atta, Rice & Dal', subcategory: 'Rice', brand: 'India Gate', price: 399, mrp: 475, unit: '5 kg', weight: '5 kg', stock: 180, tags: ['rice', 'basmati', 'essential'], images: [{ url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', alt: 'Rice' }] },
  { name: 'Toor Dal', description: 'Premium unpolished toor dal, high in protein', category: 'Atta, Rice & Dal', subcategory: 'Dals & Pulses', brand: 'Tata Sampann', price: 145, mrp: 175, unit: '1 kg', weight: '1 kg', stock: 300, tags: ['dal', 'protein', 'essential'], images: [{ url: 'https://images.unsplash.com/photo-1613758947307-f3b8f5d80711?w=400', alt: 'Toor Dal' }] },
  // Tea, Coffee & Health Drink
  { name: 'Tata Tea Gold', description: 'Rich and aromatic tea for the perfect cup', category: 'Tea, Coffee & Health Drink', subcategory: 'Tea', brand: 'Tata', price: 199, mrp: 240, unit: '500g', weight: '500g', stock: 250, tags: ['tea', 'morning', 'daily'], images: [{ url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', alt: 'Tea' }] },
  { name: 'Nescafe Classic', description: 'Instant coffee with rich aroma and smooth taste', category: 'Tea, Coffee & Health Drink', subcategory: 'Coffee', brand: 'Nescafe', price: 225, mrp: 275, unit: '200g', weight: '200g', stock: 200, tags: ['coffee', 'instant', 'morning'], images: [{ url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400', alt: 'Coffee' }] },
  // Cleaning Essentials
  { name: 'Surf Excel Detergent', description: 'Advanced stain removal detergent powder', category: 'Cleaning Essentials', subcategory: 'Detergent', brand: 'Surf Excel', price: 199, mrp: 240, unit: '1 kg', weight: '1 kg', stock: 300, tags: ['detergent', 'cleaning', 'laundry'], images: [{ url: 'https://images.unsplash.com/photo-1585441695325-21557e7c1130?w=400', alt: 'Detergent' }] },
  { name: 'Vim Dishwash Liquid', description: 'Powerful dishwash with lemon fragrance', category: 'Cleaning Essentials', subcategory: 'Dishwash', brand: 'Vim', price: 99, mrp: 115, unit: '500 ml', weight: '500 ml', stock: 250, tags: ['dishwash', 'cleaning', 'kitchen'], images: [{ url: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=400', alt: 'Dishwash' }] },
  // Personal Care
  { name: 'Dove Soap', description: 'Moisturizing beauty bar with 1/4 moisturizing cream', category: 'Personal Care', subcategory: 'Bath & Body', brand: 'Dove', price: 48, mrp: 55, unit: '100g', weight: '100g', stock: 400, tags: ['soap', 'personal care', 'moisturizing'], images: [{ url: 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=400', alt: 'Soap' }] },
  { name: 'Colgate Toothpaste', description: 'Maximum cavity protection with great taste', category: 'Personal Care', subcategory: 'Oral Care', brand: 'Colgate', price: 85, mrp: 99, unit: '150g', weight: '150g', stock: 350, tags: ['toothpaste', 'oral care', 'daily'], images: [{ url: 'https://images.unsplash.com/photo-1559526642-c3f001ea68ee?w=400', alt: 'Toothpaste' }] },
  // Instant & Frozen Food
  { name: 'Maggi 2-Minute Noodles', description: 'India\'s favourite instant noodles', category: 'Instant & Frozen Food', subcategory: 'Noodles', brand: 'Maggi', price: 56, mrp: 60, unit: '280g (4 packs)', weight: '280g', stock: 600, tags: ['noodles', 'instant', 'snack'], images: [{ url: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400', alt: 'Noodles' }] },
  // Dry Fruits, Masala & Oil
  { name: 'Fortune Sunflower Oil', description: 'Light and healthy sunflower cooking oil', category: 'Dry Fruits, Masala & Oil', subcategory: 'Cooking Oil', brand: 'Fortune', price: 185, mrp: 210, unit: '1L', weight: '1L', stock: 350, tags: ['oil', 'cooking', 'essential'], images: [{ url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400', alt: 'Oil' }] },
  { name: 'MDH Garam Masala', description: 'Authentic blend of aromatic spices', category: 'Dry Fruits, Masala & Oil', subcategory: 'Masala', brand: 'MDH', price: 72, mrp: 85, unit: '100g', weight: '100g', stock: 300, tags: ['masala', 'spice', 'cooking'], images: [{ url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400', alt: 'Masala' }] },
  // Bakery
  { name: 'Chocolate Cake', description: 'Rich chocolate cake made with Belgian chocolate', category: 'Bakery & Biscuits', subcategory: 'Cakes', brand: 'Theobroma', price: 450, mrp: 500, unit: '500g', weight: '500g', stock: 50, tags: ['cake', 'chocolate', 'dessert', 'premium'], images: [{ url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400', alt: 'Chocolate Cake' }] },
  { name: 'Parle-G Biscuits', description: 'India\'s favourite glucose biscuits', category: 'Bakery & Biscuits', subcategory: 'Biscuits', brand: 'Parle', price: 10, mrp: 10, unit: '80g', weight: '80g', stock: 800, tags: ['biscuit', 'snack', 'tea time'], images: [{ url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400', alt: 'Biscuits' }] },
  // Organic
  { name: 'Organic Honey', description: 'Raw unprocessed honey from Himalayan beehives', category: 'Organic & Healthy Living', subcategory: 'Honey', brand: 'Organic India', price: 349, mrp: 425, unit: '500g', weight: '500g', stock: 100, tags: ['honey', 'organic', 'healthy', 'natural'], isOrganic: true, isFarmDirect: true, farmDetails: { farmName: 'Himalayan Bee Farm', farmerName: 'Ramesh Kumar', location: 'Uttarakhand', certifications: ['India Organic', 'FSSAI'] }, images: [{ url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400', alt: 'Honey' }] },
];

const coupons = [
  { code: 'WELCOME50', description: 'Welcome offer - 50% off on first order', type: 'percentage', value: 50, maxDiscount: 150, minOrderAmount: 199, usageLimit: 1000, perUserLimit: 1, endDate: new Date('2027-12-31'), isActive: true },
  { code: 'GROZO100', description: 'Flat ₹100 off on orders above ₹500', type: 'flat', value: 100, minOrderAmount: 500, usageLimit: 5000, perUserLimit: 3, endDate: new Date('2027-06-30'), isActive: true },
  { code: 'FRESH20', description: '20% off on Fruits & Vegetables', type: 'percentage', value: 20, maxDiscount: 80, minOrderAmount: 150, applicableCategories: ['Fruits & Vegetables'], usageLimit: 2000, perUserLimit: 5, endDate: new Date('2027-12-31'), isActive: true },
  { code: 'ORGANIC30', description: '30% off on organic products', type: 'percentage', value: 30, maxDiscount: 200, minOrderAmount: 299, usageLimit: 1000, perUserLimit: 2, endDate: new Date('2027-12-31'), isActive: true },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Promise.all([User.deleteMany({}), Product.deleteMany({}), Coupon.deleteMany({}), DarkStore.deleteMany({})]);
    console.log('Cleared existing data');

    // Create admin user
    const admin = await User.create({ name: 'Admin User', email: 'admin@grozo.com', phone: '9999999999', password: 'admin123', role: 'admin', isVerified: true });
    console.log('✅ Admin created: admin@grozo.com / admin123');

    // Create test customer
    const customer = await User.create({ name: 'Test User', email: 'user@grozo.com', phone: '8888888888', password: 'user123', role: 'customer', isVerified: true, loyaltyPoints: 100, addresses: [{ label: 'Home', street: '123 Main Street', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', isDefault: true, location: { type: 'Point', coordinates: [72.8777, 19.0760] } }] });
    console.log('✅ Customer created: user@grozo.com / user123');

    // Seed products
    const seededProducts = await Promise.all(products.map(p => Product.create(p)));
    console.log(`✅ ${seededProducts.length} products seeded`);

    // Add flash deals to some products
    const flashProducts = seededProducts.slice(0, 5);
    for (const p of flashProducts) {
      p.isFlashDeal = true;
      p.flashDealPrice = Math.round(p.price * 0.7);
      p.flashDealEndsAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await p.save();
    }
    console.log('✅ Flash deals added');

    // Seed coupons
    await Coupon.insertMany(coupons);
    console.log('✅ Coupons seeded');

    // Create dark store
    await DarkStore.create({ name: 'Grozo Hub - Mumbai Central', code: 'MUM-001', address: { street: 'Tardeo Road', city: 'Mumbai', state: 'Maharashtra', pincode: '400034' }, location: { type: 'Point', coordinates: [72.8127, 18.9696] }, serviceRadius: 7, isOperational: true });
    console.log('✅ Dark store created');

    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
