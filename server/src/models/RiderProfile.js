const mongoose = require('mongoose');

const riderProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    vehicleType: {
      type: String,
      enum: ['Motorcycle', 'Scooter', 'Electric Vehicle (EV)', 'Bicycle'],
      default: 'Motorcycle'
    },
    vehicleNumber: {
      type: String,
      trim: true,
      default: 'DL-01-FD-1234'
    },
    drivingLicence: {
      number: { type: String, trim: true, default: 'DL-0420110012345' },
      expiryDate: { type: Date, default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
      photoUrl: { type: String, default: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400' }
    },
    identityDocument: {
      docType: { type: String, enum: ['Aadhaar', 'PAN', 'Passport', 'Voter ID'], default: 'Aadhaar' },
      number: { type: String, trim: true, default: 'XXXX-XXXX-9876' },
      photoUrl: { type: String, default: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400' }
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
      index: true
    },
    rejectionReason: String,
    isOnline: {
      type: Boolean,
      default: true,
      index: true
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true
    },
    activeDelivery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    preferredArea: {
      type: String,
      default: 'Connaught Place, New Delhi'
    },
    currentLocation: {
      lat: { type: Number, default: 28.6139 },
      lng: { type: Number, default: 77.2090 },
      address: { type: String, default: 'Connaught Place, Central Delhi' },
      updatedAt: { type: Date, default: Date.now }
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5
    },
    totalRatings: {
      type: Number,
      default: 84
    },
    totalDeliveries: {
      type: Number,
      default: 128
    },
    completedDeliveries: {
      type: Number,
      default: 125
    },
    cancelledDeliveries: {
      type: Number,
      default: 3
    },
    onlineHoursToday: {
      type: Number,
      default: 5.5
    },
    bankDetails: {
      accountHolderName: { type: String, default: 'Rahul Sharma' },
      accountNumber: { type: String, default: '918273645012' },
      ifscCode: { type: String, default: 'HDFC0001234' },
      bankName: { type: String, default: 'HDFC Bank' },
      upiId: { type: String, default: 'rahulsharma@okhdfcbank' }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('RiderProfile', riderProfileSchema);

