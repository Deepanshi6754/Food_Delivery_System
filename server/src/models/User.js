/**
 * User model defining all roles in the system.
 */
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['customer', 'restaurant_owner', 'delivery_rider', 'admin'],
      default: 'customer',
    },
    profileImage: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    accountStatus: {
      type: String,
      enum: ['pending', 'active', 'suspended', 'rejected'],
      default: 'pending',
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
