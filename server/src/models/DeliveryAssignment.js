const mongoose = require('mongoose');

const deliveryAssignmentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true
    },
    rider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: [
        'assigned',
        'accepted',
        'rejected',
        'reached_restaurant',
        'picked_up',
        'reached_customer',
        'delivered',
        'cancelled'
      ],
      default: 'assigned',
      index: true
    },
    deliveryDistanceKm: {
      type: Number,
      default: 3.5
    },
    estimatedMinutes: {
      type: Number,
      default: 25
    },
    deliveryFee: {
      type: Number, // in paise (e.g. 6500 = ₹65)
      default: 6500
    },
    customerOtp: {
      type: String,
      default: '4589'
    },
    assignedAt: {
      type: Date,
      default: Date.now
    },
    acceptedAt: Date,
    rejectedAt: Date,
    reachedRestaurantAt: Date,
    pickedUpAt: Date,
    reachedCustomerAt: Date,
    deliveredAt: Date,
    cancelledAt: Date,
    proofOfDelivery: {
      otpVerified: { type: Boolean, default: false },
      photoUrl: String,
      notes: String
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 60 * 1000) // 60s request acceptance window
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('DeliveryAssignment', deliveryAssignmentSchema);

