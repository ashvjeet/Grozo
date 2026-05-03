const Product = require('../models/Product');
const Review = require('../models/Review');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all products with filters, search, pagination
// @route   GET /api/products
exports.getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    search,
    category,
    subcategory,
    brand,
    minPrice,
    maxPrice,
    sort = '-createdAt',
    isOrganic,
    isFarmDirect,
    isFlashDeal,
    inStock
  } = req.query;

  const query = { isAvailable: true };

  if (search) {
    query.$text = { $search: search };
  }
  if (category) query.category = category;
  if (subcategory) query.subcategory = subcategory;
  if (brand) query.brand = brand;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  if (isOrganic === 'true') query.isOrganic = true;
  if (isFarmDirect === 'true') query.isFarmDirect = true;
  if (isFlashDeal === 'true') {
    query.isFlashDeal = true;
    query.flashDealEndsAt = { $gt: new Date() };
  }
  if (inStock === 'true') query.stock = { $gt: 0 };

  const skip = (Number(page) - 1) * Number(limit);

  let sortObj = {};
  if (search) {
    sortObj = { score: { $meta: 'textScore' }, ...sortObj };
  }
  const sortFields = sort.split(',').forEach(field => {
    const order = field.startsWith('-') ? -1 : 1;
    const key = field.replace('-', '');
    sortObj[key] = order;
  });

  const [products, total] = await Promise.all([
    Product.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Product.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: products,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('alternatives', 'name images price mrp unit ratings')
    .populate('comboPacks.products', 'name images price unit');

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const reviews = await Review.find({ product: req.params.id })
    .populate('user', 'name avatar')
    .sort('-createdAt')
    .limit(10);

  res.json({
    success: true,
    data: { ...product.toObject(), reviews }
  });
});

// @desc    Get categories with product counts
// @route   GET /api/products/categories
exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.aggregate([
    { $match: { isAvailable: true } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        subcategories: { $addToSet: '$subcategory' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json({ success: true, data: categories });
});

// @desc    Get flash deals
// @route   GET /api/products/flash-deals
exports.getFlashDeals = asyncHandler(async (req, res) => {
  const deals = await Product.find({
    isFlashDeal: true,
    flashDealEndsAt: { $gt: new Date() },
    isAvailable: true
  }).sort('flashDealEndsAt').limit(20);

  res.json({ success: true, data: deals });
});

// @desc    Get recommendations based on user history
// @route   GET /api/products/recommendations
exports.getRecommendations = asyncHandler(async (req, res) => {
  const Order = require('../models/Order');

  // Get user's past order categories
  const pastOrders = await Order.find({ user: req.user._id })
    .sort('-createdAt')
    .limit(10)
    .populate('items.product', 'category subcategory brand');

  const purchasedCategories = new Set();
  const purchasedBrands = new Set();
  const purchasedProducts = new Set();

  pastOrders.forEach(order => {
    order.items.forEach(item => {
      if (item.product) {
        purchasedCategories.add(item.product.category);
        purchasedBrands.add(item.product.brand);
        purchasedProducts.add(item.product._id.toString());
      }
    });
  });

  const recommendations = await Product.find({
    $or: [
      { category: { $in: [...purchasedCategories] } },
      { brand: { $in: [...purchasedBrands] } }
    ],
    _id: { $nin: [...purchasedProducts] },
    isAvailable: true,
    stock: { $gt: 0 }
  })
    .sort('-ratings.average -purchaseCount')
    .limit(20);

  res.json({ success: true, data: recommendations });
});

// @desc    Smart basket optimization - suggest cheaper alternatives
// @route   POST /api/products/optimize-basket
exports.optimizeBasket = asyncHandler(async (req, res) => {
  const { items } = req.body; // [{ productId, quantity }]

  const suggestions = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) continue;

    // Find cheaper alternatives in same category
    const alternatives = await Product.find({
      category: product.category,
      subcategory: product.subcategory,
      _id: { $ne: product._id },
      price: { $lt: product.price },
      isAvailable: true,
      stock: { $gte: item.quantity },
      'ratings.average': { $gte: 3.5 }
    })
      .sort('price -ratings.average')
      .limit(3);

    if (alternatives.length > 0) {
      suggestions.push({
        original: {
          _id: product._id,
          name: product.name,
          price: product.price,
          image: product.images[0]?.url
        },
        alternatives: alternatives.map(alt => ({
          _id: alt._id,
          name: alt.name,
          price: alt.price,
          savings: (product.price - alt.price) * item.quantity,
          rating: alt.ratings.average,
          image: alt.images[0]?.url
        })),
        quantity: item.quantity
      });
    }
  }

  const totalPotentialSavings = suggestions.reduce(
    (sum, s) => sum + (s.alternatives[0]?.savings || 0), 0
  );

  res.json({
    success: true,
    data: {
      suggestions,
      totalPotentialSavings
    }
  });
});

// @desc    Generate AI Meal Plan & Grocery List
// @route   POST /api/products/meal-planner
exports.generateMealPlan = asyncHandler(async (req, res) => {
  const { diet, calories, servings = 2, days = 3 } = req.body;
  
  // A simplistic mock AI engine that maps to actual store products
  // In a real app, you'd call OpenAI API here and have it return a JSON structure mapping to your product inventory.
  
  const allProducts = await Product.find({ isAvailable: true }).lean();
  
  const findProduct = (keyword, fallbackCategory) => {
    return allProducts.find(p => p.name.toLowerCase().includes(keyword.toLowerCase())) || 
           allProducts.find(p => p.category === fallbackCategory);
  };

  const mealPlans = [];
  const groceryListMap = new Map();

  for (let i = 1; i <= days; i++) {
    let breakfast, lunch, dinner;
    
    if (diet === 'Vegetarian') {
      breakfast = { name: 'Oatmeal with Fruits', ingredients: [{ keyword: 'Oats', qty: 1 }, { keyword: 'Bananas', qty: 1 }] };
      lunch = { name: 'Palak Paneer & Roti', ingredients: [{ keyword: 'Paneer', qty: 1 }, { keyword: 'Spinach', qty: 2 }, { keyword: 'Atta', qty: 1 }] };
      dinner = { name: 'Dal Tadka & Rice', ingredients: [{ keyword: 'Moong Dal', qty: 1 }, { keyword: 'Basmati Rice', qty: 1 }] };
    } else if (diet === 'Vegan') {
      breakfast = { name: 'Chia Seed Pudding', ingredients: [{ keyword: 'Chia Seeds', qty: 1 }, { keyword: 'Bananas', qty: 1 }] };
      lunch = { name: 'Quinoa Salad', ingredients: [{ keyword: 'Quinoa', qty: 1 }, { keyword: 'Tomatoes', qty: 1 }, { keyword: 'Cucumber', qty: 1 }] };
      dinner = { name: 'Mixed Veg Curry', ingredients: [{ keyword: 'Potatoes', qty: 1 }, { keyword: 'Carrots', qty: 1 }, { keyword: 'Capsicum', qty: 1 }] };
    } else {
      // Default / Healthy
      breakfast = { name: 'Eggs & Toast', ingredients: [{ keyword: 'Eggs', qty: 1 }, { keyword: 'Bread', qty: 1 }] };
      lunch = { name: 'Veg Pulao', ingredients: [{ keyword: 'Basmati Rice', qty: 1 }, { keyword: 'Peas', qty: 1 }, { keyword: 'Carrots', qty: 1 }] };
      dinner = { name: 'Paneer Tikka', ingredients: [{ keyword: 'Paneer', qty: 1 }, { keyword: 'Capsicum', qty: 1 }, { keyword: 'Onions', qty: 1 }] };
    }

    mealPlans.push({ day: i, breakfast, lunch, dinner });

    // Aggregate groceries
    [breakfast, lunch, dinner].forEach(meal => {
      meal.ingredients.forEach(ing => {
        const product = findProduct(ing.keyword, 'Fruits & Vegetables');
        if (product) {
          const id = product._id.toString();
          if (groceryListMap.has(id)) {
            groceryListMap.get(id).quantity += Math.ceil(ing.qty * servings / 2);
          } else {
            groceryListMap.set(id, {
              product,
              quantity: Math.ceil(ing.qty * servings / 2)
            });
          }
        }
      });
    });
  }

  let groceryList = Array.from(groceryListMap.values()).map(item => ({
    product: {
      _id: item.product._id,
      name: item.product.name,
      price: item.product.price,
      image: item.product.images[0]?.url,
      unit: item.product.unit
    },
    quantity: item.quantity,
    totalPrice: item.quantity * item.product.price
  }));

  // Sort by price ascending to drop the most expensive items first if over budget
  // or maybe drop the least essential items first. We will just sort descending by price and drop if needed.
  let totalCost = groceryList.reduce((sum, item) => sum + item.totalPrice, 0);
  
  if (req.body.budget && totalCost > req.body.budget) {
    // Sort items by price (most expensive first)
    groceryList.sort((a, b) => b.totalPrice - a.totalPrice);
    while (totalCost > req.body.budget && groceryList.length > 0) {
      const removed = groceryList.shift(); // Remove the most expensive item
      totalCost -= removed.totalPrice;
    }
  }

  res.json({
    success: true,
    data: {
      mealPlans,
      groceryList,
      totalCost
    }
  });
});

// @desc    Create product (Admin)
// @route   POST /api/products
exports.createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, data: product });
});

// @desc    Update product (Admin)
// @route   PUT /api/products/:id
exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.json({ success: true, data: product });
});

// @desc    Delete product (Admin)
// @route   DELETE /api/products/:id
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.json({ success: true, message: 'Product deleted' });
});

// @desc    Add review
// @route   POST /api/products/:id/reviews
exports.addReview = asyncHandler(async (req, res) => {
  const { rating, title, comment } = req.body;
  const productId = req.params.id;

  const existingReview = await Review.findOne({
    user: req.user._id,
    product: productId
  });

  if (existingReview) {
    return res.status(400).json({
      success: false,
      message: 'You have already reviewed this product'
    });
  }

  const review = await Review.create({
    user: req.user._id,
    product: productId,
    rating,
    title,
    comment,
    isVerifiedPurchase: true
  });

  // Update product rating
  const stats = await Review.aggregate([
    { $match: { product: review.product } },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);

  await Product.findByIdAndUpdate(productId, {
    'ratings.average': Math.round(stats[0].avgRating * 10) / 10,
    'ratings.count': stats[0].count
  });

  await review.populate('user', 'name avatar');
  res.status(201).json({ success: true, data: review });
});
