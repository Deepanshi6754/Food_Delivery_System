const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Please provide coupon code'],
      unique: true,
      uppercase: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    maxDiscount: {
      type: Number,
      default: 0 // in paise
    },
    flatDiscount: {
      type: Number,
      default: 0 // in paise
    },
    minOrderValue: {
      type: Number,
      default: 0 // in paise
    },
    expiresAt: {
      type: Date,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    newUserOnly: {
      type: Boolean,
      default: false
    },
    restaurantSpecific: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant'
      }
    ],
    usageLimit: {
      type: Number,
      default: 10000
    },
    usedCount: {
      type: Number,
      default: 0
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isPlatformWide: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Coupon', couponSchema);

