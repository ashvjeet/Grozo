const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const addressSchema = new mongoose.Schema({
  label: { type: String, default: 'Home' },
  street: String,
  apartment: String,
  city: String,
  state: String,
  pincode: String,
  landmark: String,
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  isDefault: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    unique: true,
    sparse: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  avatar: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['customer', 'admin', 'delivery', 'dark_store_manager'],
    default: 'customer'
  },
  addresses: [addressSchema],
  wallet: {
    balance: { type: Number, default: 0 },
    transactions: [{
      amount: Number,
      type: { type: String, enum: ['credit', 'debit'] },
      description: String,
      date: { type: Date, default: Date.now }
    }]
  },
  loyaltyPoints: { type: Number, default: 0 },
  streakDays: { type: Number, default: 0 },
  lastOrderDate: Date,
  preferences: {
    dietary: [String],
    favoriteCategories: [String],
    language: { type: String, default: 'en' }
  },
  subscriptions: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    frequency: { type: String, enum: ['daily', 'weekly', 'biweekly', 'monthly'] },
    nextDelivery: Date,
    isActive: { type: Boolean, default: true }
  }],
  pantry: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    expiryDate: Date,
    addedAt: { type: Date, default: Date.now }
  }],
  groupOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GroupOrder' }],
  isVerified: { type: Boolean, default: false },
  otp: { code: String, expiresAt: Date },
  refreshToken: String,
  fcmToken: String,
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

userSchema.index({ 'addresses.location': '2dsphere' });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '30d' }
  );
};

module.exports = mongoose.model('User', userSchema);
