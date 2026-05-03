const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { asyncHandler } = require('../middleware/errorHandler');

exports.getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id })
    .populate('items.product', 'name images price mrp discount unit stock isAvailable');
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

  let subtotal = 0, mrpTotal = 0;
  for (const item of cart.items) {
    if (item.product && item.product.isAvailable) {
      subtotal += item.product.price * item.quantity;
      mrpTotal += item.product.mrp * item.quantity;
    }
  }
  const deliveryFee = subtotal >= 199 ? 0 : 25;
  let discount = 0;
  if (cart.appliedCoupon?.code) {
    discount = cart.appliedCoupon.type === 'percentage'
      ? Math.min((subtotal * cart.appliedCoupon.discount) / 100, 500)
      : cart.appliedCoupon.discount;
  }

  res.json({
    success: true,
    data: { ...cart.toObject(), subtotal, mrpTotal, savings: mrpTotal - subtotal, deliveryFee, discount, total: subtotal + deliveryFee - discount, itemCount: cart.items.reduce((s, i) => s + i.quantity, 0) }
  });
});

exports.addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  if (product.stock < quantity) return res.status(400).json({ success: false, message: 'Not enough stock' });

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });

  const existing = cart.items.find(i => i.product.toString() === productId);
  if (existing) { existing.quantity += quantity; } else { cart.items.push({ product: productId, quantity }); }
  await cart.save();
  await cart.populate('items.product', 'name images price mrp discount unit stock');
  res.json({ success: true, data: cart });
});

exports.updateCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

  if (quantity <= 0) { cart.items = cart.items.filter(i => i.product.toString() !== productId); }
  else { const item = cart.items.find(i => i.product.toString() === productId); if (item) item.quantity = quantity; }
  await cart.save();
  await cart.populate('items.product', 'name images price mrp discount unit stock');
  res.json({ success: true, data: cart });
});

exports.removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
  cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
  await cart.save();
  res.json({ success: true, data: cart });
});

exports.clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], appliedCoupon: null });
  res.json({ success: true, message: 'Cart cleared' });
});

exports.applyCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findOne({ code: req.body.code.toUpperCase(), isActive: true, endDate: { $gte: new Date() } });
  if (!coupon) return res.status(400).json({ success: false, message: 'Invalid or expired coupon' });
  const cart = await Cart.findOne({ user: req.user._id });
  cart.appliedCoupon = { code: coupon.code, discount: coupon.value, type: coupon.type };
  await cart.save();
  res.json({ success: true, message: 'Coupon applied', data: cart.appliedCoupon });
});

exports.removeCoupon = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { appliedCoupon: null });
  res.json({ success: true, message: 'Coupon removed' });
});
