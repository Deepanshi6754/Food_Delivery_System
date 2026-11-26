const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const RiderProfile = require('../models/RiderProfile');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'fooddelight_secret_jwt_key_2026',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// @desc    Register a new delivery partner
// @route   POST /api/v1/rider/auth/register
// @access  Public
const registerRider = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      vehicleType,
      vehicleNumber,
      drivingLicenceNumber,
      preferredArea
    } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, phone number, and password.'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Create User with role 'delivery_partner'
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: 'delivery_partner',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      isApproved: false,
      approvalStatus: 'pending'
    });

    // Create RiderProfile with verificationStatus 'pending'
    const profile = await RiderProfile.create({
      user: user._id,
      vehicleType: vehicleType || 'Motorcycle',
      vehicleNumber: vehicleNumber || 'DL-01-NEW-RIDER',
      drivingLicence: {
        number: drivingLicenceNumber || 'DL-PENDING',
        photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400'
      },
      preferredArea: preferredArea || 'Central Delhi',
      verificationStatus: 'pending',
      isOnline: false,
      isAvailable: false
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Delivery partner registration submitted! Account is pending administrator document verification.',
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
      profile
    });
  } catch (err) {
    console.error('Rider register error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error during delivery partner registration.'
    });
  }
};

// @desc    Login delivery partner
// @route   POST /api/v1/rider/auth/login
// @access  Public
const loginRider = async (req, res) => {
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

    if (
      user.role !== 'rider' &&
      user.role !== 'delivery_partner' &&
      user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only registered delivery partners can log in.'
      });
    }

    const isMatch = user.matchPassword
      ? await user.matchPassword(password)
      : await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    let profile = await RiderProfile.findOne({ user: user._id });
    if (!profile) {
      profile = await RiderProfile.create({
        user: user._id,
        vehicleType: 'Motorcycle',
        vehicleNumber: 'DL-01-FD-5678',
        verificationStatus: 'approved',
        isOnline: true,
        isAvailable: true
      });
    }

    const token = generateToken(user._id);

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      approvalStatus: user.approvalStatus
    };

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully as delivery partner.',
      token,
      data: userData,
      user: userData,
      profile
    });
  } catch (err) {
    console.error('Rider login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during delivery partner login.'
    });
  }
};

// @desc    Get current authenticated rider and profile
// @route   GET /api/v1/rider/auth/me
// @access  Private (Rider)
const getRiderMe = async (req, res) => {
  try {
    const profile = await RiderProfile.findOne({ user: req.user._id }).populate('activeDelivery');

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
      profile
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve delivery partner profile.'
    });
  }
};

// @desc    Update rider password
// @route   PUT /api/v1/rider/auth/password
// @access  Private (Rider)
const updateRiderPassword = async (req, res) => {
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
    const isMatch = user.matchPassword
      ? await user.matchPassword(currentPassword)
      : await bcrypt.compare(currentPassword, user.password);

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
  registerRider,
  loginRider,
  getRiderMe,
  updateRiderPassword
};

