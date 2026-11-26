/**
 * User model defining all roles in the system.
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    passwordHash: { type: String, select: false },
    password: { type: String, select: false },
    role: {
      type: String,
      enum: ['customer', 'restaurant_owner', 'delivery_rider', 'delivery_partner', 'rider', 'admin'],
      default: 'customer',
    },
    profileImage: { type: String },
    avatar: { type: String },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
    adminRole: { type: String },
    isApproved: { type: Boolean, default: false },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved'
    },
    isSuspended: { type: Boolean, default: false },
    suspensionReason: { type: String, default: '' },
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

userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return;
  }

  this.passwordHash = await bcrypt.hash(this.password, 12);
  this.password = undefined;
});

userSchema.methods.matchPassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
