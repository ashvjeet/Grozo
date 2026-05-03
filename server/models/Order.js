const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: String,
  image: String,
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  total: Number
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  couponCode: String,
  taxes: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  walletDeduction: { type: Number, default: 0 },
  loyaltyPointsUsed: { type: Number, default: 0 },
  deliveryAddress: {
    label: String,
    street: String,
    apartment: String,
    city: String,
    state: String,
    pincode: String,
    landmark: String,
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: [Number]
    }
  },
  status: {
    type: String,
    enum: ['placed', 'confirmed', 'picking', 'packed', 'dispatched', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'],
    default: 'placed',
    index: true
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String
  }],
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'wallet', 'cod', 'netbanking'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: String,
  deliveryType: {
    type: String,
    enum: ['instant', 'scheduled', 'eco'],
    default: 'instant'
  },
  scheduledSlot: {
    date: Date,
    timeSlot: String
  },
  isEcoDelivery: { type: Boolean, default: false },
  deliveryAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryAgent'
  },
  darkStore: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DarkStore'
  },
  estimatedDelivery: Date,
  actualDelivery: Date,
  trackingUpdates: [{
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: [Number]
    },
    timestamp: { type: Date, default: Date.now },
    status: String
  }],
  rating: {
    score: { type: Number, min: 1, max: 5 },
    comment: String,
    deliveryRating: { type: Number, min: 1, max: 5 }
  },
  isGroupOrder: { type: Boolean, default: false },
  groupOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'GroupOrder' },
  notes: String,
  refundAmount: Number,
  refundReason: String
}, {
  timestamps: true
});

orderSchema.index({ 'deliveryAddress.location': '2dsphere' });

orderSchema.pre('save', function () {
  if (!this.orderNumber) {
    this.orderNumber = 'GRZ-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
});

module.exports = mongoose.model('Order', orderSchema);
