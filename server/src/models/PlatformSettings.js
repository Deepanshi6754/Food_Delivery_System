const mongoose = require('mongoose');

const platformSettingsSchema = new mongoose.Schema(
  {
    platformName: {
      type: String,
      default: 'FoodDelight'
    },
    platformTagline: {
      type: String,
      default: 'Premium Culinary Delivery'
    },
    supportEmail: {
      type: String,
      default: 'support@fooddelight.com'
    },
    supportPhone: {
      type: String,
      default: '+91 1800 123 4567'
    },
    currency: {
      type: String,
      default: 'INR'
    },
    currencySymbol: {
      type: String,
      default: '₹'
    },
    defaultCommissionRate: {
      type: Number, // Percentage, e.g. 15 = 15%
      default: 15,
      min: 0,
      max: 100
    },
    deliveryFeeBase: {
      type: Number, // in paise, e.g. 3900 = ₹39
      default: 3900
    },
    deliveryFeePerKm: {
      type: Number, // in paise, e.g. 1000 = ₹10
      default: 1000
    },
    taxRate: {
      type: Number, // Percentage, e.g. 5 = 5% GST
      default: 5,
      min: 0,
      max: 30
    },
    minOrderAmount: {
      type: Number, // in paise, e.g. 9900 = ₹99
      default: 9900
    },
    freeDeliveryThreshold: {
      type: Number, // in paise, e.g. 49900 = ₹499
      default: 49900
    },
    maintenanceMode: {
      type: Boolean,
      default: false
    },
    maintenanceMessage: {
      type: String,
      default: 'FoodDelight is currently undergoing scheduled platform upgrades. We will be back online shortly!'
    },
    orderCancellationWindowMinutes: {
      type: Number,
      default: 5
    },
    autoApproveRestaurants: {
      type: Boolean,
      default: false
    },
    autoApproveRiders: {
      type: Boolean,
      default: false
    },
    serviceableCities: {
      type: [String],
      default: ['Delhi', 'Noida', 'Gurugram', 'Bengaluru', 'Mumbai']
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

// Ensure single instance helper
platformSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('PlatformSettings', platformSettingsSchema);
