const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fooddelight_secret_jwt_key_2026', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @desc    Register a new restaurant owner & pending restaurant
// @route   POST /api/v1/owner/auth/register
// @access  Public
const registerOwner = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      restaurantName,
      cuisine,
      address,
      description
    } = req.body;

    if (!name || !email || !phone || !password || !restaurantName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields including restaurant name.'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    // Generate unique slug
    const baseSlug = restaurantName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let slug = baseSlug;
    let count = 1;
    while (await Restaurant.findOne({ slug })) {
      slug = `${baseSlug}-${count++}`;
    }

    // Create restaurant with approvalStatus = 'pending'
    const newRestaurant = await Restaurant.create({
      name: restaurantName,
      slug,
      description: description || `Welcome to ${restaurantName}! Delicious freshly cooked meals delivered fast.`,
      cuisine: Array.isArray(cuisine) && cuisine.length > 0 ? cuisine : ['North Indian', 'Fast Food'],
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500',
      coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200',
      contactEmail: email,
      contactPhone: phone,
      address: address || {
        street: 'Main Road',
        area: 'Commercial Hub',
        city: 'New Delhi',
        pincode: '110001'
      },
      approvalStatus: 'pending', // Requires admin approval
      isOpen: false
    });

    // Create User with role 'restaurant_owner'
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: 'restaurant_owner',
      restaurant: newRestaurant._id,
      approvalStatus: 'pending',
      isApproved: false
    });

    // Link restaurant to user
    newRestaurant.owner = user._id;
    await newRestaurant.save();

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Restaurant registration submitted successfully! Your account is pending admin approval.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        approvalStatus: user.approvalStatus
      },
      restaurant: {
        id: newRestaurant._id,
        name: newRestaurant.name,
        slug: newRestaurant.slug,
        approvalStatus: newRestaurant.approvalStatus
      }
    });
  } catch (err) {
    console.error('Register owner error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error during restaurant owner registration.'
    });
  }
};

// @desc    Login restaurant owner
// @route   POST /api/v1/owner/auth/login
// @access  Public
const loginOwner = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.'
      });
    }

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (user.role !== 'restaurant_owner' && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only registered restaurant owners can access this portal.'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    let restaurant = await Restaurant.findOne({ owner: user._id });
    if (!restaurant && user.restaurant) {
      restaurant = await Restaurant.findById(user.restaurant);
    }
    if (!restaurant && user.email === 'owner@fooddelight.com') {
      restaurant = await Restaurant.findOne();
      if (restaurant) {
        restaurant.owner = user._id;
        await restaurant.save();
        user.restaurant = restaurant._id;
        await user.save();
      }
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully as restaurant owner.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        approvalStatus: user.approvalStatus
      },
      restaurant: restaurant
        ? {
            id: restaurant._id,
            name: restaurant.name,
            slug: restaurant.slug,
            image: restaurant.image,
            isOpen: restaurant.isOpen,
            isTemporarilyClosed: restaurant.isTemporarilyClosed,
            approvalStatus: restaurant.approvalStatus
          }
        : null
    });
  } catch (err) {
    console.error('Login owner error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during restaurant owner login.'
    });
  }
};

// @desc    Get current authenticated owner and restaurant
// @route   GET /api/v1/owner/auth/me
// @access  Private (Owner)
const getMe = async (req, res) => {
  try {
    let restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant && req.user.restaurant) {
      restaurant = await Restaurant.findById(req.user.restaurant);
    }

    return res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        avatar: req.user.avatar,
        approvalStatus: req.user.approvalStatus
      },
      restaurant
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve owner profile.'
    });
  }
};

// @desc    Update owner password
// @route   PUT /api/v1/owner/auth/password
// @access  Private (Owner)
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    const user = await User.findById(req.user._id).select('+passwordHash');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password does not match.'
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully.'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update password.'
    });
  }
};

module.exports = {
  registerOwner,
  loginOwner,
  getMe,
  updatePassword
};
