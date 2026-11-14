const mongoose = require('mongoose');

const riderLocationSchema = new mongoose.Schema(
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
      index: true
    },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    heading: {
      type: Number,
      default: 0
    },
    speed: {
      type: Number,
      default: 25 // km/h
    },
    address: String
  },
  { timestamps: true }
);

module.exports = mongoose.model('RiderLocation', riderLocationSchema);

