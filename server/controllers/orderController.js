const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { LOYALTY_POINTS } = require('../config/constants');

exports.placeOrder = asyncHandler(async (req, res) => {
  const { deliveryAddress, paymentMethod, deliveryType = 'instant', scheduledSlot, isEcoDelivery, notes, loyaltyPointsToUse = 0 } = req.body;
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart || cart.items.length === 0) return res.status(400).json({ success: false, message: 'Cart is empty' });

  let subtotal = 0;
  const orderItems = [];
  for (const item of cart.items) {
    if (!item.product || !item.product.isAvailable) continue;
    if (item.product.stock < item.quantity) return res.status(400).json({ success: false, message: `${item.product.name} is out of stock` });
    const price = item.product.price;
    orderItems.push({ product: item.product._id, name: item.product.name, image: item.product.images[0]?.url || '', price, quantity: item.quantity, total: price * item.quantity });
    subtotal += price * item.quantity;
  }

  const deliveryFee = subtotal >= 199 ? 0 : (isEcoDelivery ? 10 : 25);
  let discount = 0;
  if (cart.appliedCoupon?.code) {
    discount = cart.appliedCoupon.type === 'percentage' ? Math.min((subtotal * cart.appliedCoupon.discount) / 100, 500) : cart.appliedCoupon.discount;
  }
  const loyaltyDiscount = Math.min(loyaltyPointsToUse, req.user.loyaltyPoints || 0, subtotal * 0.1);
  const taxes = Math.round(subtotal * 0.05 * 100) / 100;
  const totalAmount = Math.max(subtotal + deliveryFee + taxes - discount - loyaltyDiscount, 0);

  const order = await Order.create({
    user: req.user._id, items: orderItems, subtotal, deliveryFee, discount, couponCode: cart.appliedCoupon?.code, taxes, totalAmount,
    loyaltyPointsUsed: loyaltyDiscount, deliveryAddress, paymentMethod, deliveryType, scheduledSlot, isEcoDelivery, notes,
    status: paymentMethod === 'cod' ? 'confirmed' : 'placed',
    paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
    statusHistory: [{ status: 'placed', timestamp: new Date(), note: 'Order placed successfully' }],
    estimatedDelivery: new Date(Date.now() + (deliveryType === 'instant' ? 15 : 60) * 60000)
  });

  // Update stock
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity, purchaseCount: item.quantity } });
  }

  // Award loyalty points
  const pointsEarned = LOYALTY_POINTS.PER_ORDER + Math.floor(totalAmount / 100) * LOYALTY_POINTS.PER_100_SPENT;
  await User.findByIdAndUpdate(req.user._id, {
    $inc: { loyaltyPoints: pointsEarned - loyaltyDiscount },
    $set: { lastOrderDate: new Date() },
    $inc: { streakDays: 1 }
  });

  // Clear cart
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], appliedCoupon: null });

  // Emit socket event
  const io = req.app.get('io');
  if (io) io.to(`user_${req.user._id}`).emit('orderPlaced', { orderId: order._id, orderNumber: order.orderNumber });

  const responseData = { ...order.toObject(), pointsEarned };
  if (paymentMethod !== 'cod') {
    responseData.requiresPayment = true;
  }

  res.status(201).json({ success: true, data: responseData });
});

exports.getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const query = { user: req.user._id };
  if (status) query.status = status;
  const [orders, total] = await Promise.all([
    Order.find(query).sort('-createdAt').skip((page - 1) * limit).limit(Number(limit)).populate('items.product', 'name images').lean(),
    Order.countDocuments(query)
  ]);
  res.json({ success: true, data: orders, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) } });
});

exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('items.product', 'name images price unit').populate('deliveryAgent', 'name phone vehicleType currentLocation');
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  res.json({ success: true, data: order });
});

exports.cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (order.user.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized' });
  if (!['placed', 'confirmed'].includes(order.status)) return res.status(400).json({ success: false, message: 'Cannot cancel at this stage' });

  order.status = 'cancelled';
  order.statusHistory.push({ status: 'cancelled', note: req.body.reason || 'Cancelled by user' });
  await order.save();

  // Restore stock
  for (const item of order.items) { await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } }); }

  const io = req.app.get('io');
  if (io) io.to(`user_${req.user._id}`).emit('orderCancelled', { orderId: order._id });

  res.json({ success: true, data: order });
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  
  order.status = status;
  order.statusHistory.push({ status, note, timestamp: new Date() });
  if (status === 'delivered') { order.actualDelivery = new Date(); order.paymentStatus = 'completed'; }
  await order.save();

  const io = req.app.get('io');
  if (io) io.to(`user_${order.user}`).emit('orderStatusUpdate', { orderId: order._id, status, note });

  res.json({ success: true, data: order });
});

exports.reorder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('items.product');
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });

  for (const item of order.items) {
    if (item.product && item.product.isAvailable && item.product.stock > 0) {
      const existing = cart.items.find(i => i.product.toString() === item.product._id.toString());
      if (existing) { existing.quantity = item.quantity; } else { cart.items.push({ product: item.product._id, quantity: item.quantity }); }
    }
  }
  await cart.save();
  res.json({ success: true, message: 'Items added to cart' });
});

exports.getSpendingInsights = asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const orders = await Order.find({ user: req.user._id, status: 'delivered', createdAt: { $gte: thirtyDaysAgo } });
  
  const totalSpent = orders.reduce((s, o) => s + o.totalAmount, 0);
  const totalOrders = orders.length;
  const categorySpend = {};
  
  for (const order of orders) {
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        categorySpend[product.category] = (categorySpend[product.category] || 0) + item.total;
      }
    }
  }

  res.json({ success: true, data: { totalSpent, totalOrders, avgOrderValue: totalOrders ? totalSpent / totalOrders : 0, categoryBreakdown: Object.entries(categorySpend).map(([cat, amount]) => ({ category: cat, amount })).sort((a, b) => b.amount - a.amount), totalSaved: orders.reduce((s, o) => s + o.discount, 0) } });
});

// @desc    Get all active orders for delivery partners
// @route   GET /api/orders/active
exports.getActiveOrders = asyncHandler(async (req, res) => {
  const activeOrders = await Order.find({
    status: { $in: ['placed', 'confirmed', 'picking', 'packed', 'dispatched', 'out_for_delivery'] }
  })
    .populate('user', 'name phone')
    .sort('createdAt');

  res.json({ success: true, data: activeOrders });
});
