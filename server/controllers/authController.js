const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Register user
// @route   POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role } = req.body;

  const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email or phone already exists'
    });
  }

  // Only allow registration of customer or delivery
  const assignedRole = role === 'delivery' ? 'delivery' : 'customer';
  const user = await User.create({ name, email, phone, password, role: assignedRole });

  const token = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save();

  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      loyaltyPoints: user.loyaltyPoints,
      token,
      refreshToken
    }
  });
});

// @desc    Login user
// @route   POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password'
    });
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Update streak
  const now = new Date();
  if (user.lastOrderDate) {
    const daysDiff = Math.floor((now - user.lastOrderDate) / (1000 * 60 * 60 * 24));
    if (daysDiff > 2) {
      user.streakDays = 0;
    }
  }

  const token = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save();

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      addresses: user.addresses,
      loyaltyPoints: user.loyaltyPoints,
      streakDays: user.streakDays,
      wallet: { balance: user.wallet.balance },
      preferences: user.preferences,
      token,
      refreshToken
    }
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('subscriptions.productId', 'name images price unit')
    .populate('pantry.productId', 'name images price unit');

  res.json({
    success: true,
    data: user
  });
});

// @desc    Update profile
// @route   PUT /api/auth/profile
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar, preferences } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (phone) updates.phone = phone;
  if (avatar) updates.avatar = avatar;
  if (preferences) updates.preferences = { ...req.user.preferences, ...preferences };

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true
  });

  res.json({ success: true, data: user });
});

// @desc    Add address
// @route   POST /api/auth/address
exports.addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (req.body.isDefault) {
    user.addresses.forEach(addr => addr.isDefault = false);
  }
  
  user.addresses.push(req.body);
  await user.save();

  res.status(201).json({ success: true, data: user.addresses });
});

// @desc    Delete address
// @route   DELETE /api/auth/address/:addressId
exports.deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter(
    addr => addr._id.toString() !== req.params.addressId
  );
  await user.save();
  res.json({ success: true, data: user.addresses });
});

// @desc    Refresh token
// @route   POST /api/auth/refresh-token
exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ success: false, message: 'Refresh token required' });
  }

  const jwt = require('jsonwebtoken');
  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id);

  if (!user || user.refreshToken !== refreshToken) {
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }

  const newToken = user.generateAuthToken();
  const newRefreshToken = user.generateRefreshToken();
  user.refreshToken = newRefreshToken;
  await user.save();

  res.json({
    success: true,
    data: { token: newToken, refreshToken: newRefreshToken }
  });
});

// @desc    Update pantry
// @route   PUT /api/auth/pantry
exports.updatePantry = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { productId, quantity, expiryDate, action } = req.body;

  if (action === 'add') {
    const existing = user.pantry.find(p => p.productId.toString() === productId);
    if (existing) {
      existing.quantity = quantity;
      if (expiryDate) existing.expiryDate = expiryDate;
    } else {
      user.pantry.push({ productId, quantity, expiryDate });
    }
  } else if (action === 'remove') {
    user.pantry = user.pantry.filter(p => p.productId.toString() !== productId);
  }

  await user.save();
  await user.populate('pantry.productId', 'name images price unit');
  res.json({ success: true, data: user.pantry });
});
