const mongoose = require('mongoose');

const deliveryAgentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: String,
  avatar: String,
  vehicleType: {
    type: String,
    enum: ['bicycle', 'ev_bike', 'bike', 'van'],
    default: 'bike'
  },
  vehicleNumber: String,
  licenseNumber: String,
  currentLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  isAvailable: { type: Boolean, default: true },
  isOnline: { type: Boolean, default: false },
  activeOrders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  completedOrders: { type: Number, default: 0 },
  earnings: {
    today: { type: Number, default: 0 },
    week: { type: Number, default: 0 },
    month: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  rating: {
    average: { type: Number, default: 5, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  assignedDarkStore: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DarkStore'
  },
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    bankName: String
  },
  documents: {
    idProof: String,
    addressProof: String,
    drivingLicense: String
  },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

deliveryAgentSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('DeliveryAgent', deliveryAgentSchema);
