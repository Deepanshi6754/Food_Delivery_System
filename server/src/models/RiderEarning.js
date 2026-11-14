const mongoose = require('mongoose');

const riderEarningSchema = new mongoose.Schema(
  {
    rider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: false
    },
    deliveryAssignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DeliveryAssignment'
    },
    baseFee: {
      type: Number, // in paise
      default: 4000
    },
    deliveryFee: {
      type: Number, // alias in paise
      default: 4000
    },
    distanceFee: {
      type: Number, // in paise
      default: 1500
    },
    incentives: {
      type: Number, // in paise
      default: 1000
    },
    bonus: {
      type: Number,
      default: 0
    },
    tip: {
      type: Number,
      default: 0
    },
    tips: {
      type: Number, // in paise
      default: 0
    },
    platformFee: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number, // in paise
      required: true,
      default: 6500
    },
    status: {
      type: String,
      enum: ['earned', 'credited', 'paid_out'],
      default: 'credited'
    },
    notes: {
      type: String,
      default: ''
    },
    date: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

riderEarningSchema.pre('validate', function () {
  if (!this.totalAmount) {
    const fee = this.deliveryFee || this.baseFee || 4000;
    const dist = this.distanceFee || 0;
    const inc = this.incentives || this.bonus || 0;
    const t = this.tips || this.tip || 0;
    const plat = this.platformFee || 0;
    this.totalAmount = Math.max(0, fee + dist + inc + t - plat);
  }
});

module.exports = mongoose.model('RiderEarning', riderEarningSchema);
