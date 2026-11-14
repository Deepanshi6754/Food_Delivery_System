const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    amount: {
      type: Number,
      required: true // in paise
    },
    currency: {
      type: String,
      default: 'INR'
    },
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
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    refundId: String,
    errorMessage: String
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);

