const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Please provide dish name'],
      trim: true,
      index: true
    },
    description: {
      type: String,
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Please provide dish price in paise'],
      min: 0
    },
    category: {
      type: String,
      required: [true, 'Please provide category name'],
      trim: true,
      index: true
    },
    image: {
      type: String,
      required: true
    },
    isVeg: {
      type: Boolean,
      default: true,
      index: true
    },
    isVegan: {
      type: Boolean,
      default: false,
      index: true
    },
    isJain: {
      type: Boolean,
      default: false,
      index: true
    },
    isBestseller: {
      type: Boolean,
      default: false
    },
    rating: {
      type: Number,
      default: 4.6,
      min: 1,
      max: 5
    },
    reviewCount: {
      type: Number,
      default: 48
    },
    available: {
      type: Boolean,
      default: true
    },
    isFlagged: {
      type: Boolean,
      default: false,
      index: true
    },
    moderationStatus: {
      type: String,
      enum: ['active', 'flagged', 'banned'],
      default: 'active',
      index: true
    },
    moderationReason: {
      type: String,
      default: ''
    },
    customizations: {
      sizes: [
        {
          name: { type: String, required: true },
          priceDelta: { type: Number, default: 0 } // in paise
        }
      ],
      addOns: [
        {
          name: { type: String, required: true },
          price: { type: Number, required: true } // in paise
        }
      ]
    }
  },
  { timestamps: true }
);

menuItemSchema.index({ name: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('MenuItem', menuItemSchema);

