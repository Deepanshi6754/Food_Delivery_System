const mongoose = require('mongoose');

const riderPayoutSchema = new mongoose.Schema(
  {
    rider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    amount: {
      type: Number, // in paise
      required: true
    },
    period: {
      startDate: Date,
      endDate: Date
    },
    totalDeliveries: {
      type: Number,
      default: 0
    },
    payoutMethod: {
      type: String,
      enum: ['bank_transfer', 'upi'],
      default: 'bank_transfer'
    },
    bankDetails: {
      accountHolderName: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      upiId: String
    },
    transactionReference: {
      type: String,
      default: () => `RDR-PAY-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'completed'
    },
    processedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('RiderPayout', riderPayoutSchema);

