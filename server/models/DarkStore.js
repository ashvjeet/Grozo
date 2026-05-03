const mongoose = require('mongoose');

const darkStoreSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  serviceRadius: { type: Number, default: 5 }, // in km
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  operatingHours: {
    open: { type: String, default: '06:00' },
    close: { type: String, default: '23:00' }
  },
  isOperational: { type: Boolean, default: true },
  deliveryAgents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryAgent' }],
  capacity: {
    totalProducts: { type: Number, default: 5000 },
    currentProducts: { type: Number, default: 0 }
  },
  metrics: {
    ordersToday: { type: Number, default: 0 },
    avgDeliveryTime: { type: Number, default: 12 }, // minutes
    rating: { type: Number, default: 4.5 }
  }
}, {
  timestamps: true
});

darkStoreSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('DarkStore', darkStoreSchema);
