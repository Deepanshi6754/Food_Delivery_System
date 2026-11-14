const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true
    },
    period: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true }
    },
    totalOrders: {
      type: Number,
      required: true,
      default: 0
    },
    grossRevenue: {
      type: Number, // in paise
      required: true,
      default: 0
    },
    commission: {
      type: Number, // in paise
      required: true,
      default: 0
    },
    discountFunded: {
      type: Number, // in paise
      default: 0
    },
    refunds: {
      type: Number, // in paise
      default: 0
    },
    netPayable: {
      type: Number, // in paise
      required: true,
      default: 0
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'completed'
    },
    processedAt: {
      type: Date,
      default: Date.now
    },
    transactionReference: {
      type: String,
      default: () => `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payout', payoutSchema);

