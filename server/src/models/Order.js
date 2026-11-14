const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem'
  },
  name: {
    type: String,
    required: true
  },
  image: String,
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  size: {
    name: String,
    priceDelta: Number
  },
  addOns: [
    {
      name: String,
      price: Number
    }
  ],
  specialInstructions: String,
  itemTotal: {
    type: Number,
    required: true
  }
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    restaurant: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
      },
      name: { type: String, required: true },
      image: String,
      phone: String,
      address: {
        street: String,
        area: String,
        city: String
      }
    },
    items: [orderItemSchema],
    deliveryAddress: {
      label: { type: String, default: 'Home' },
      recipientName: { type: String, required: true },
      phone: { type: String, required: true },
      houseNo: { type: String, required: true },
      street: { type: String, required: true },
      area: { type: String, required: true },
      landmark: String,
      city: { type: String, required: true },
      state: { type: String, default: 'Delhi' },
      pincode: { type: String, required: true },
      deliveryInstructions: String
    },
    pricing: {
      subtotal: { type: Number, required: true }, // in paise
      deliveryFee: { type: Number, required: true },
      taxes: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      finalAmount: { type: Number, required: true }
    },
    payment: {
      method: {
        type: String,
        enum: ['razorpay', 'cod', 'upi', 'card'],
        default: 'cod'
      },
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
      },
      transactionId: String,
      razorpayOrderId: String,
      razorpayPaymentId: String
    },
    orderStatus: {
      type: String,
      enum: [
        'placed',
        'confirmed',
        'preparing',
        'ready_for_pickup',
        'out_for_delivery',
        'delivered',
        'cancelled'
      ],
      default: 'placed',
      index: true
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: String
      }
    ],
    rider: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      name: { type: String, default: 'Rahul Sharma' },
      phone: { type: String, default: '+91 98765 43210' },
      vehicleNumber: { type: String, default: 'DL-01-FD-5678' },
      vehicleType: { type: String, default: 'Motorcycle' },
      avatar: {
        type: String,
        default: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
      },
      stage: {
        type: String,
        enum: ['assigned', 'accepted', 'reached_restaurant', 'picked_up', 'reached_customer', 'delivered'],
        default: 'assigned'
      },
      location: {
        lat: { type: Number, default: 28.6139 },
        lng: { type: Number, default: 77.2090 }
      }
    },
    deliveryOtp: {
      type: String,
      default: () => Math.floor(1000 + Math.random() * 9000).toString()
    },
    estimatedDeliveryTime: {
      type: String,
      default: '30-40 mins'
    },
    specialInstructions: String,
    couponApplied: String,
    cancellationReason: String,
    isReviewed: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);

