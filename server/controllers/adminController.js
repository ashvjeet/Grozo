const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const DeliveryAgent = require('../models/DeliveryAgent');
const { asyncHandler } = require('../middleware/errorHandler');

exports.getDashboard = asyncHandler(async (req, res) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [todayOrders, monthOrders, totalUsers, totalProducts, activeAgents, pendingOrders, recentOrders] = await Promise.all([
    Order.countDocuments({ createdAt: { $gte: today } }),
    Order.find({ createdAt: { $gte: thisMonth } }),
    User.countDocuments({ role: 'customer' }),
    Product.countDocuments({ isAvailable: true }),
    DeliveryAgent.countDocuments({ isOnline: true }),
    Order.countDocuments({ status: { $in: ['placed', 'confirmed', 'picking'] } }),
    Order.find().sort('-createdAt').limit(10).populate('user', 'name email')
  ]);

  const monthRevenue = monthOrders.reduce((s, o) => s + o.totalAmount, 0);
  const todayRevenue = monthOrders.filter(o => o.createdAt >= today).reduce((s, o) => s + o.totalAmount, 0);

  res.json({ success: true, data: { stats: { todayOrders, todayRevenue, monthRevenue, totalUsers, totalProducts, activeAgents, pendingOrders }, recentOrders } });
});

exports.getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;
  const query = {};
  if (status) query.status = status;
  if (search) query.orderNumber = { $regex: search, $options: 'i' };
  const [orders, total] = await Promise.all([
    Order.find(query).sort('-createdAt').skip((page - 1) * limit).limit(Number(limit)).populate('user', 'name email phone').populate('deliveryAgent', 'name phone'),
    Order.countDocuments(query)
  ]);
  res.json({ success: true, data: orders, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) } });
});

exports.getAnalytics = asyncHandler(async (req, res) => {
  const { period = '30' } = req.query;
  const startDate = new Date(Date.now() - Number(period) * 24 * 60 * 60 * 1000);
  
  const [salesByDay, topProducts, categoryStats] = await Promise.all([
    Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: { $ne: 'cancelled' } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, orders: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
      { $sort: { _id: 1 } }
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: 'delivered' } },
      { $unwind: '$items' },
      { $group: { _id: '$items.name', totalQty: { $sum: '$items.quantity' }, revenue: { $sum: '$items.total' } } },
      { $sort: { totalQty: -1 } },
      { $limit: 10 }
    ]),
    Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, avgPrice: { $avg: '$price' } } },
      { $sort: { count: -1 } }
    ])
  ]);

  res.json({ success: true, data: { salesByDay, topProducts, categoryStats } });
});

exports.getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role } = req.query;
  const query = {};
  if (role) query.role = role;
  const [users, total] = await Promise.all([
    User.find(query).sort('-createdAt').skip((page - 1) * limit).limit(Number(limit)).select('-password -refreshToken'),
    User.countDocuments(query)
  ]);
  res.json({ success: true, data: users, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) } });
});

exports.manageCoupon = asyncHandler(async (req, res) => {
  if (req.method === 'POST') {
    const coupon = await Coupon.create(req.body);
    return res.status(201).json({ success: true, data: coupon });
  }
  if (req.method === 'GET') {
    const coupons = await Coupon.find().sort('-createdAt');
    return res.json({ success: true, data: coupons });
  }
});

exports.updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: coupon });
});

exports.deleteCoupon = asyncHandler(async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Coupon deleted' });
});
