const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');

/**
 * Protect routes - only authenticated restaurant owners (or platform admin)
 */
const protectOwner = async (req, res, next) => {
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
        message: 'Authentication required. Please log in to access the owner portal.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fooddelight_secret_jwt_key_2026');

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Account not found. Authentication failed.'
      });
    }

    if (user.role !== 'restaurant_owner' && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Restaurant owner privileges required.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.'
    });
  }
};

/**
 * Attach owner's restaurant to req.restaurant
 */
const attachRestaurant = async (req, res, next) => {
  try {
    // 1. Find by owner field or by user's assigned restaurant
    let restaurant = await Restaurant.findOne({ owner: req.user._id });

    if (!restaurant && req.user.restaurant) {
      restaurant = await Restaurant.findById(req.user.restaurant);
    }

    // Fallback for admin or seeded demo owner if not linked
    if (!restaurant && req.user.email === 'owner@fooddelight.com') {
      restaurant = await Restaurant.findOne();
      if (restaurant) {
        restaurant.owner = req.user._id;
        await restaurant.save();
      }
    }

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        noRestaurant: true,
        message: 'No restaurant associated with this owner account. Please register a restaurant first.'
      });
    }

    req.restaurant = restaurant;
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching owner restaurant details.'
    });
  }
};

module.exports = {
  protectOwner,
  attachRestaurant
};

