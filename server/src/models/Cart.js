const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  image: String,
  isVeg: {
    type: Boolean,
    default: true
  },
  basePrice: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  size: {
    name: String,
    priceDelta: { type: Number, default: 0 }
  },
  addOns: [
    {
      name: String,
      price: Number
    }
  ],
  specialInstructions: {
    type: String,
    default: ''
  },
  itemTotal: {
    type: Number,
    required: true
  }
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant'
    },
    items: [cartItemSchema],
    appliedCoupon: {
      code: String,
      discountPercentage: Number,
      maxDiscount: Number,
      flatDiscount: Number,
      discountAmount: { type: Number, default: 0 }
    },
    subtotal: {
      type: Number,
      default: 0
    },
    deliveryFee: {
      type: Number,
      default: 0
    },
    taxes: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    finalAmount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cart', cartSchema);

