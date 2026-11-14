const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide restaurant name'],
      trim: true,
      index: true
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    cuisine: {
      type: [String],
      required: true,
      index: true
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 1,
      max: 5,
      index: true
    },
    reviewCount: {
      type: Number,
      default: 120
    },
    deliveryTime: {
      type: String,
      default: '25-35 mins'
    },
    deliveryTimeMinutes: {
      type: Number,
      default: 30,
      index: true
    },
    deliveryFee: {
      type: Number,
      default: 3900 // ₹39 in paise
    },
    minOrderValue: {
      type: Number,
      default: 14900 // ₹149 in paise
    },
    priceForTwo: {
      type: Number,
      default: 45000 // ₹450 in paise
    },
    image: {
      type: String,
      required: true
    },
    coverImage: {
      type: String,
      required: true
    },
    isOpen: {
      type: Boolean,
      default: true
    },
    openingTime: {
      type: String,
      default: '09:00 AM'
    },
    closingTime: {
      type: String,
      default: '11:00 PM'
    },
    address: {
      street: String,
      area: String,
      city: String,
      pincode: String
    },
    tags: [String],
    isPureVeg: {
      type: Boolean,
      default: false,
      index: true
    },
    badge: {
      type: String,
      default: ''
    },
    offers: [
      {
        code: String,
        title: String,
        discountText: String,
        minOrder: Number
      }
    ],
    featured: {
      type: Boolean,
      default: false
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
      index: true
    },
    contactEmail: {
      type: String,
      trim: true
    },
    contactPhone: {
      type: String,
      trim: true
    },
    preparationTime: {
      type: Number,
      default: 25 // minutes
    },
    isTemporarilyClosed: {
      type: Boolean,
      default: false
    },
    platformCommission: {
      type: Number,
      default: 15 // percentage
    },
    isSuspended: {
      type: Boolean,
      default: false,
      index: true
    },
    suspensionReason: {
      type: String,
      default: ''
    },
    operatingHours: [
      {
        day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
        open: { type: String, default: '09:00 AM' },
        close: { type: String, default: '11:00 PM' },
        isClosed: { type: Boolean, default: false }
      }
    ]
  },
  { timestamps: true }
);

restaurantSchema.index({ name: 'text', description: 'text', cuisine: 'text' });

module.exports = mongoose.model('Restaurant', restaurantSchema);

