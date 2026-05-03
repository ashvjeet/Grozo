require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');
const User = require('../models/User');

const extraProducts = [
  // More Fruits & Vegetables
  { name: 'Green Grapes', description: 'Seedless green grapes, sweet and juicy', category: 'Fruits & Vegetables', subcategory: 'Fresh Fruits', brand: 'Farm Fresh', price: 85, mrp: 110, unit: '500g', weight: '500g', stock: 250, tags: ['fruit','grapes'], images: [{ url: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400', alt: 'Grapes' }] },
  { name: 'Fresh Mangoes', description: 'Alphonso mangoes, king of fruits', category: 'Fruits & Vegetables', subcategory: 'Fresh Fruits', brand: 'Ratnagiri Farms', price: 350, mrp: 450, unit: '1 kg', weight: '1 kg', stock: 150, tags: ['fruit','mango','seasonal'], isOrganic: true, isFarmDirect: true, farmDetails: { farmName: 'Ratnagiri Orchards', farmerName: 'Suresh Patil', location: 'Maharashtra' }, images: [{ url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400', alt: 'Mangoes' }] },
  { name: 'Fresh Carrots', description: 'Crunchy orange carrots rich in beta-carotene', category: 'Fruits & Vegetables', subcategory: 'Fresh Vegetables', brand: 'Green Valley', price: 32, mrp: 42, unit: '500g', weight: '500g', stock: 400, tags: ['vegetable','carrot','healthy'], images: [{ url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400', alt: 'Carrots' }] },
  { name: 'Capsicum Mix', description: 'Colorful bell peppers - red, yellow, green', category: 'Fruits & Vegetables', subcategory: 'Fresh Vegetables', brand: 'Farm Fresh', price: 95, mrp: 120, unit: '500g', weight: '500g', stock: 180, tags: ['vegetable','capsicum'], images: [{ url: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400', alt: 'Capsicum' }] },
  { name: 'Fresh Cucumber', description: 'Cool and refreshing cucumber for salads', category: 'Fruits & Vegetables', subcategory: 'Fresh Vegetables', brand: 'Farm Fresh', price: 20, mrp: 28, unit: '500g', weight: '500g', stock: 350, tags: ['vegetable','cucumber','salad'], images: [{ url: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400', alt: 'Cucumber' }] },
  { name: 'Watermelon', description: 'Sweet and juicy watermelon, perfect summer fruit', category: 'Fruits & Vegetables', subcategory: 'Fresh Fruits', brand: 'Farm Fresh', price: 45, mrp: 60, unit: '1 piece', weight: '2 kg', stock: 100, tags: ['fruit','watermelon','summer'], images: [{ url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400', alt: 'Watermelon' }] },
  { name: 'Broccoli', description: 'Fresh green broccoli florets, superfood', category: 'Fruits & Vegetables', subcategory: 'Fresh Vegetables', brand: 'Organic India', price: 65, mrp: 80, unit: '250g', weight: '250g', stock: 120, tags: ['vegetable','broccoli','superfood'], isOrganic: true, images: [{ url: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400', alt: 'Broccoli' }] },
  // More Dairy
  { name: 'Amul Butter', description: 'Utterly butterly delicious table butter', category: 'Dairy & Breakfast', subcategory: 'Butter & Cheese', brand: 'Amul', price: 56, mrp: 60, unit: '100g', weight: '100g', stock: 500, tags: ['butter','dairy','breakfast'], images: [{ url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400', alt: 'Butter' }] },
  { name: 'Cheese Slices', description: 'Processed cheese slices for sandwiches', category: 'Dairy & Breakfast', subcategory: 'Butter & Cheese', brand: 'Amul', price: 115, mrp: 130, unit: '200g', weight: '200g', stock: 300, tags: ['cheese','dairy','sandwich'], images: [{ url: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400', alt: 'Cheese' }] },
  { name: 'Oats', description: 'Rolled oats for healthy breakfast', category: 'Dairy & Breakfast', subcategory: 'Cereals', brand: 'Quaker', price: 135, mrp: 160, unit: '1 kg', weight: '1 kg', stock: 220, tags: ['oats','breakfast','healthy','fiber'], images: [{ url: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400', alt: 'Oats' }] },
  { name: 'Cornflakes', description: 'Crunchy corn flakes with vitamins & iron', category: 'Dairy & Breakfast', subcategory: 'Cereals', brand: 'Kelloggs', price: 175, mrp: 210, unit: '475g', weight: '475g', stock: 280, tags: ['cereal','breakfast','cornflakes'], images: [{ url: 'https://images.unsplash.com/photo-1521483451569-e33803c0330c?w=400', alt: 'Cornflakes' }] },
  // More Snacks
  { name: 'Kurkure Masala Munch', description: 'Crunchy namkeen snack with tangy masala', category: 'Snacks & Munchies', subcategory: 'Namkeen', brand: 'Kurkure', price: 20, mrp: 20, unit: '70g', weight: '70g', stock: 450, tags: ['snack','namkeen','masala'], images: [{ url: 'https://images.unsplash.com/photo-1599490659213-e2b9527b711e?w=400', alt: 'Kurkure' }] },
  { name: 'Peanut Butter', description: 'Creamy peanut butter, high in protein', category: 'Snacks & Munchies', subcategory: 'Spreads', brand: 'Pintola', price: 299, mrp: 350, unit: '350g', weight: '350g', stock: 180, tags: ['peanut butter','protein','healthy'], images: [{ url: 'https://images.unsplash.com/photo-1600850056064-a8b380df8395?w=400', alt: 'Peanut Butter' }] },
  { name: 'Dark Chocolate', description: '70% cocoa dark chocolate bar', category: 'Sweet Tooth', subcategory: 'Chocolates', brand: 'Cadbury', price: 120, mrp: 140, unit: '80g', weight: '80g', stock: 200, tags: ['chocolate','dark','premium'], images: [{ url: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=400', alt: 'Dark Chocolate' }] },
  { name: 'Rasgulla', description: 'Soft spongy rasgulla in sugar syrup', category: 'Sweet Tooth', subcategory: 'Indian Sweets', brand: 'Haldirams', price: 190, mrp: 220, unit: '1 kg', weight: '1 kg', stock: 100, tags: ['sweet','rasgulla','dessert'], images: [{ url: 'https://images.unsplash.com/photo-1666190410918-66c5b525de3a?w=400', alt: 'Rasgulla' }] },
  // More Beverages
  { name: 'Coconut Water', description: 'Natural tender coconut water, refreshing', category: 'Cold Drinks & Juices', subcategory: 'Health Drinks', brand: 'Raw Pressery', price: 45, mrp: 55, unit: '200 ml', weight: '200 ml', stock: 350, tags: ['coconut','healthy','hydration'], isOrganic: true, images: [{ url: 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=400', alt: 'Coconut Water' }] },
  { name: 'Green Tea', description: 'Pure green tea with antioxidants', category: 'Tea, Coffee & Health Drink', subcategory: 'Tea', brand: 'Organic India', price: 185, mrp: 225, unit: '25 bags', weight: '50g', stock: 200, tags: ['tea','green','healthy','antioxidant'], isOrganic: true, images: [{ url: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=400', alt: 'Green Tea' }] },
  { name: 'Bournvita', description: 'Health drink with vitamins & minerals for kids', category: 'Tea, Coffee & Health Drink', subcategory: 'Health Drinks', brand: 'Cadbury', price: 230, mrp: 275, unit: '500g', weight: '500g', stock: 300, tags: ['health drink','kids','nutrition'], images: [{ url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400', alt: 'Bournvita' }] },
  // More Cleaning & Personal Care
  { name: 'Harpic Toilet Cleaner', description: 'Powerful toilet cleaning liquid', category: 'Cleaning Essentials', subcategory: 'Toilet Cleaners', brand: 'Harpic', price: 89, mrp: 105, unit: '500 ml', weight: '500 ml', stock: 300, tags: ['cleaning','toilet','bathroom'], images: [{ url: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=400', alt: 'Harpic' }] },
  { name: 'Dettol Handwash', description: 'Antibacterial liquid handwash', category: 'Personal Care', subcategory: 'Hand Wash', brand: 'Dettol', price: 99, mrp: 115, unit: '200 ml', weight: '200 ml', stock: 350, tags: ['handwash','hygiene','antibacterial'], images: [{ url: 'https://images.unsplash.com/photo-1584305574647-0cc949a2bb9e?w=400', alt: 'Handwash' }] },
  { name: 'Head & Shoulders Shampoo', description: 'Anti-dandruff shampoo for clean scalp', category: 'Personal Care', subcategory: 'Hair Care', brand: 'Head & Shoulders', price: 210, mrp: 250, unit: '340 ml', weight: '340 ml', stock: 200, tags: ['shampoo','hair','dandruff'], images: [{ url: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=400', alt: 'Shampoo' }] },
  // More Staples
  { name: 'Moong Dal', description: 'Split moong dal for everyday cooking', category: 'Atta, Rice & Dal', subcategory: 'Dals & Pulses', brand: 'Tata Sampann', price: 130, mrp: 155, unit: '1 kg', weight: '1 kg', stock: 280, tags: ['dal','moong','protein'], images: [{ url: 'https://images.unsplash.com/photo-1613758947307-f3b8f5d80711?w=400', alt: 'Moong Dal' }] },
  { name: 'Sugar', description: 'Refined white sugar crystals', category: 'Atta, Rice & Dal', subcategory: 'Sugar & Salt', brand: 'Uttam', price: 48, mrp: 52, unit: '1 kg', weight: '1 kg', stock: 500, tags: ['sugar','essential','daily'], images: [{ url: 'https://images.unsplash.com/photo-1581268208878-04c0c62a7e63?w=400', alt: 'Sugar' }] },
  // Instant Food
  { name: 'MTR Poha Mix', description: 'Ready to cook breakfast poha mix', category: 'Instant & Frozen Food', subcategory: 'Ready to Cook', brand: 'MTR', price: 50, mrp: 60, unit: '180g', weight: '180g', stock: 250, tags: ['instant','breakfast','poha'], images: [{ url: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400', alt: 'Poha' }] },
  { name: 'Frozen Peas', description: 'Quick-frozen green peas, ready to cook', category: 'Instant & Frozen Food', subcategory: 'Frozen Veggies', brand: 'Safal', price: 75, mrp: 90, unit: '500g', weight: '500g', stock: 200, tags: ['frozen','peas','vegetable'], images: [{ url: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400', alt: 'Frozen Peas' }] },
  // Baby & Pet Care
  { name: 'Baby Diapers', description: 'Ultra-soft baby diapers, 12hr absorption', category: 'Baby Care', subcategory: 'Diapers', brand: 'Pampers', price: 499, mrp: 599, unit: '32 pcs', weight: '1 kg', stock: 150, tags: ['baby','diapers','care'], images: [{ url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400', alt: 'Diapers' }] },
  { name: 'Cerelac Baby Food', description: 'Wheat-based baby cereal with milk', category: 'Baby Care', subcategory: 'Baby Food', brand: 'Nestle', price: 275, mrp: 320, unit: '300g', weight: '300g', stock: 180, tags: ['baby','food','cereal'], images: [{ url: 'https://images.unsplash.com/photo-1590080874088-eec64895b423?w=400', alt: 'Baby Food' }] },
  { name: 'Dog Food', description: 'Complete nutrition dry dog food for adult dogs', category: 'Pet Care', subcategory: 'Dog Food', brand: 'Pedigree', price: 450, mrp: 520, unit: '1.2 kg', weight: '1.2 kg', stock: 100, tags: ['pet','dog','food'], images: [{ url: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=400', alt: 'Dog Food' }] },
  // More Organic
  { name: 'Organic Turmeric Powder', description: 'Pure organic turmeric, anti-inflammatory', category: 'Organic & Healthy Living', subcategory: 'Organic Spices', brand: 'Organic Tattva', price: 110, mrp: 140, unit: '100g', weight: '100g', stock: 200, tags: ['organic','turmeric','spice','healthy'], isOrganic: true, isFarmDirect: true, farmDetails: { farmName: 'Kerala Spice Farm', farmerName: 'Vijay Menon', location: 'Kerala' }, images: [{ url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400', alt: 'Turmeric' }] },
  { name: 'Quinoa', description: 'Superfood quinoa grain, gluten-free', category: 'Organic & Healthy Living', subcategory: 'Superfoods', brand: 'True Elements', price: 299, mrp: 380, unit: '500g', weight: '500g', stock: 120, tags: ['quinoa','superfood','healthy','gluten-free'], isOrganic: true, images: [{ url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', alt: 'Quinoa' }] },
  { name: 'Chia Seeds', description: 'Omega-3 rich chia seeds for smoothies', category: 'Organic & Healthy Living', subcategory: 'Superfoods', brand: 'True Elements', price: 199, mrp: 250, unit: '200g', weight: '200g', stock: 150, tags: ['chia','superfood','omega3'], isOrganic: true, images: [{ url: 'https://images.unsplash.com/photo-1511690743698-d9d18f7e20f1?w=400', alt: 'Chia Seeds' }] },
  // More Masala & Oil
  { name: 'Mustard Oil', description: 'Cold-pressed mustard oil for authentic taste', category: 'Dry Fruits, Masala & Oil', subcategory: 'Cooking Oil', brand: 'Fortune', price: 165, mrp: 190, unit: '1L', weight: '1L', stock: 280, tags: ['oil','mustard','cooking'], images: [{ url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400', alt: 'Mustard Oil' }] },
  { name: 'Cashew Nuts', description: 'Premium whole cashew nuts, roasted & salted', category: 'Dry Fruits, Masala & Oil', subcategory: 'Dry Fruits', brand: 'Nutraj', price: 425, mrp: 520, unit: '250g', weight: '250g', stock: 100, tags: ['cashew','dry fruit','premium','snack'], images: [{ url: 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=400', alt: 'Cashews' }] },
  // More Bakery
  { name: 'Multigrain Bread', description: 'Healthy multigrain bread with seeds', category: 'Bakery & Biscuits', subcategory: 'Bread', brand: 'Britannia', price: 55, mrp: 65, unit: '400g', weight: '400g', stock: 200, tags: ['bread','multigrain','healthy'], images: [{ url: 'https://images.unsplash.com/photo-1549931319-a545753467c8?w=400', alt: 'Multigrain Bread' }] },
  { name: 'Oreo Biscuits', description: 'Chocolate sandwich cookies with cream filling', category: 'Bakery & Biscuits', subcategory: 'Biscuits', brand: 'Cadbury', price: 30, mrp: 30, unit: '120g', weight: '120g', stock: 400, tags: ['biscuit','chocolate','cream'], images: [{ url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400', alt: 'Oreo' }] },
];

const reviewComments = [
  'Great quality, will buy again!', 'Fresh and well packaged', 'Good value for money',
  'Delivered on time, very fresh', 'Excellent product, highly recommended',
  'Perfect for daily use', 'Kids love it!', 'Best brand in this category',
  'Slightly expensive but worth it', 'Amazing taste and quality',
  'Regular purchase, always consistent', 'Quick delivery, good packaging',
];

const seedMore = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB...');

    // Get existing users
    const customer = await User.findOne({ email: 'user@grozo.com' });
    const admin = await User.findOne({ email: 'admin@grozo.com' });
    if (!customer) { console.error('Run npm run seed first!'); process.exit(1); }

    // Create more test customers
    const customers = [customer];
    const extraUsers = [
      { name: 'Priya Sharma', email: 'priya@test.com', phone: '7777777777', password: 'test123', role: 'customer', isVerified: true, loyaltyPoints: 250 },
      { name: 'Rahul Verma', email: 'rahul@test.com', phone: '6666666666', password: 'test123', role: 'customer', isVerified: true, loyaltyPoints: 180 },
      { name: 'Anita Patel', email: 'anita@test.com', phone: '5555555555', password: 'test123', role: 'customer', isVerified: true, loyaltyPoints: 320 },
    ];
    for (const u of extraUsers) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        const created = await User.create(u);
        customers.push(created);
        console.log(`✅ User created: ${u.name}`);
      } else { customers.push(exists); }
    }

    // Seed extra products
    let newCount = 0;
    for (const p of extraProducts) {
      const exists = await Product.findOne({ name: p.name });
      if (!exists) { await Product.create(p); newCount++; }
    }
    console.log(`✅ ${newCount} new products added`);

    // Get all products & add ratings + purchaseCount
    const allProducts = await Product.find({});
    for (const p of allProducts) {
      if (p.ratings.average === 0) {
        p.ratings.average = +(3.5 + Math.random() * 1.5).toFixed(1);
        p.ratings.count = Math.floor(10 + Math.random() * 200);
        p.purchaseCount = Math.floor(50 + Math.random() * 500);
        await p.save();
      }
    }
    console.log(`✅ Ratings & purchase counts added to ${allProducts.length} products`);

    // Add flash deals to more products
    const nonFlash = await Product.find({ isFlashDeal: false }).limit(8);
    for (const p of nonFlash.slice(0, 6)) {
      p.isFlashDeal = true;
      p.flashDealPrice = Math.round(p.price * (0.6 + Math.random() * 0.15));
      p.flashDealEndsAt = new Date(Date.now() + (12 + Math.random() * 36) * 60 * 60 * 1000);
      await p.save();
    }
    console.log('✅ More flash deals added');

    // Create sample orders
    const existingOrders = await Order.countDocuments();
    if (existingOrders < 5) {
      const statuses = ['delivered', 'delivered', 'delivered', 'out_for_delivery', 'confirmed', 'placed'];
      const payMethods = ['cod', 'upi', 'card', 'wallet', 'upi', 'cod'];
      for (let i = 0; i < 12; i++) {
        const user = customers[i % customers.length];
        const orderProducts = [];
        const numItems = 2 + Math.floor(Math.random() * 4);
        const usedIdx = new Set();
        for (let j = 0; j < numItems; j++) {
          let idx;
          do { idx = Math.floor(Math.random() * allProducts.length); } while (usedIdx.has(idx));
          usedIdx.add(idx);
          const prod = allProducts[idx];
          const qty = 1 + Math.floor(Math.random() * 3);
          orderProducts.push({ product: prod._id, name: prod.name, image: prod.images?.[0]?.url || '', price: prod.price, quantity: qty, total: prod.price * qty });
        }
        const subtotal = orderProducts.reduce((s, it) => s + it.total, 0);
        const deliveryFee = subtotal > 199 ? 0 : 25;
        const taxes = Math.round(subtotal * 0.05);
        const status = statuses[i % statuses.length];
        const daysAgo = Math.floor(Math.random() * 25);
        const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

        await Order.create({
          user: user._id,
          items: orderProducts,
          subtotal,
          deliveryFee,
          taxes,
          discount: Math.floor(Math.random() * 50),
          totalAmount: subtotal + deliveryFee + taxes,
          paymentMethod: payMethods[i % payMethods.length],
          paymentStatus: status === 'delivered' ? 'completed' : 'pending',
          status,
          deliveryType: ['instant', 'scheduled', 'eco'][i % 3],
          deliveryAddress: { label: 'Home', street: '123 Main St', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', location: { type: 'Point', coordinates: [72.8777, 19.076] } },
          statusHistory: [{ status: 'placed', timestamp: createdAt, note: 'Order placed' }],
          estimatedDelivery: new Date(createdAt.getTime() + 15 * 60 * 1000),
          createdAt,
          updatedAt: createdAt,
        });
      }
      console.log('✅ 12 sample orders created');
    }

    // Create reviews
    const existingReviews = await Review.countDocuments();
    if (existingReviews < 5) {
      let revCount = 0;
      for (let i = 0; i < Math.min(20, allProducts.length); i++) {
        const prod = allProducts[i];
        const reviewer = customers[i % customers.length];
        const exists = await Review.findOne({ product: prod._id, user: reviewer._id });
        if (!exists) {
          await Review.create({
            user: reviewer._id,
            product: prod._id,
            rating: Math.ceil(3 + Math.random() * 2),
            title: 'Great product!',
            comment: reviewComments[i % reviewComments.length],
            isVerifiedPurchase: true,
          });
          revCount++;
        }
      }
      console.log(`✅ ${revCount} reviews created`);
    }

    console.log('\n🎉 Additional data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedMore();
