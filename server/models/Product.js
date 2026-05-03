const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    index: 'text'
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  images: [{
    url: String,
    alt: String
  }],
  category: {
    type: String,
    required: [true, 'Category is required'],
    index: true
  },
  subcategory: {
    type: String,
    index: true
  },
  brand: {
    type: String,
    index: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  mrp: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  unit: {
    type: String,
    required: true
  },
  weight: String,
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  minOrderQty: { type: Number, default: 1 },
  maxOrderQty: { type: Number, default: 10 },
  tags: [String],
  nutritionInfo: {
    calories: Number,
    protein: String,
    carbs: String,
    fat: String,
    fiber: String
  },
  isOrganic: { type: Boolean, default: false },
  isFarmDirect: { type: Boolean, default: false },
  farmDetails: {
    farmName: String,
    farmerName: String,
    location: String,
    certifications: [String]
  },
  alternatives: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  comboPacks: [{
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    comboPrice: Number,
    savings: Number
  }],
  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  purchaseCount: { type: Number, default: 0 },
  isAvailable: { type: Boolean, default: true },
  isFlashDeal: { type: Boolean, default: false },
  flashDealPrice: Number,
  flashDealEndsAt: Date,
  darkStoreInventory: [{
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'DarkStore' },
    quantity: Number,
    aisle: String,
    shelf: String
  }]
}, {
  timestamps: true
});

productSchema.index({ name: 'text', description: 'text', tags: 'text', brand: 'text' });
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'ratings.average': -1 });
productSchema.index({ purchaseCount: -1 });

productSchema.pre('save', function () {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  if (this.mrp && this.price) {
    this.discount = Math.round(((this.mrp - this.price) / this.mrp) * 100);
  }
});

productSchema.virtual('effectivePrice').get(function () {
  if (this.isFlashDeal && this.flashDealEndsAt > new Date()) {
    return this.flashDealPrice;
  }
  return this.price;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
