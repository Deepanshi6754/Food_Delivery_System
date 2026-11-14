const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RiderProfile = require('../models/RiderProfile');

/**
 * Protect routes - only authenticated delivery riders or admin
 */
const protectRider = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to access the delivery partner portal.'
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fooddelight_secret_jwt_key_2026'
    );

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Account not found. Authentication failed.'
      });
    }

    if (
      user.role !== 'rider' &&
      user.role !== 'delivery_partner' &&
      user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Delivery partner credentials required.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired rider session.'
    });
  }
};

/**
 * Attach rider profile to req.riderProfile
 */
const attachRiderProfile = async (req, res, next) => {
  try {
    let profile = await RiderProfile.findOne({ user: req.user._id });

    if (!profile) {
      // Auto-create initial profile for the rider if none exists
      profile = await RiderProfile.create({
        user: req.user._id,
        vehicleType: 'Motorcycle',
        vehicleNumber: 'DL-01-FD-5678',
        verificationStatus: 'approved',
        isOnline: true,
        isAvailable: true
      });
    }

    req.riderProfile = profile;
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching rider profile.'
    });
  }
};

module.exports = {
  protectRider,
  attachRiderProfile
};

