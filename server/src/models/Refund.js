const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true
    },
    orderNumber: {
      type: String,
      required: true,
      index: true
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    amount: {
      type: Number, // in paise
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'processed', 'failed'],
      default: 'pending',
      index: true
    },
    refundMethod: {
      type: String,
      enum: ['original_source', 'wallet', 'bank_transfer', 'upi'],
      default: 'original_source'
    },
    providerReference: {
      type: String,
      default: ''
    },
    adminNotes: {
      type: String,
      default: ''
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    processedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

refundSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Refund', refundSchema);
