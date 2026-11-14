const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    label: {
      type: String,
      enum: ['Home', 'Work', 'Other'],
      default: 'Home'
    },
    recipientName: {
      type: String,
      required: [true, 'Please provide recipient name'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Please provide recipient phone number'],
      trim: true
    },
    houseNo: {
      type: String,
      required: [true, 'Please provide house / flat / floor number'],
      trim: true
    },
    street: {
      type: String,
      required: [true, 'Please provide street / road address'],
      trim: true
    },
    area: {
      type: String,
      required: [true, 'Please provide area or locality'],
      trim: true
    },
    landmark: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      required: [true, 'Please provide city'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'Please provide state'],
      trim: true
    },
    pincode: {
      type: String,
      required: [true, 'Please provide 6-digit PIN code'],
      trim: true
    },
    deliveryInstructions: {
      type: String,
      trim: true
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    coordinates: {
      lat: { type: Number, default: 28.6139 },
      lng: { type: Number, default: 77.209 }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Address', addressSchema);

