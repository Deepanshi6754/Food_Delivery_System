const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { recordAudit } = require('../middleware/adminAuth');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'fooddelight_secret_jwt_key_2026',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// @desc    Admin login
// @route   POST /api/v1/admin/auth/login
// @access  Public
const loginAdmin = async (req, res) => {
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
        message: 'Invalid administrator credentials.'
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Administrator credentials required.'
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: `Account is suspended: ${user.suspensionReason || 'Contact Super Admin'}`
      });
    }

    const isMatch = user.matchPassword
      ? await user.matchPassword(password)
      : await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrator credentials.'
      });
    }

    const token = generateToken(user._id);

    const adminUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      adminRole: user.adminRole || 'super_admin',
      avatar: user.avatar
    };

    // Log admin login activity
    await recordAudit({
      admin: user,
      action: 'admin_login',
      targetType: 'Auth',
      targetId: user._id,
      targetName: user.name,
      reason: 'Standard Admin Session Started',
      req
    });

    return res.status(200).json({
      success: true,
      message: 'Admin session authenticated successfully.',
      token,
      data: adminUser,
      user: adminUser
    });
  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during admin login.'
    });
  }
};

// @desc    Get current admin profile & permissions
// @route   GET /api/v1/admin/auth/me
// @access  Private (Admin)
const getAdminMe = async (req, res) => {
  try {
    const user = req.user;
    const adminUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      adminRole: user.adminRole || 'super_admin',
      avatar: user.avatar,
      createdAt: user.createdAt
    };

    return res.status(200).json({
      success: true,
      data: adminUser,
      user: adminUser
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin details.'
    });
  }
};

// @desc    Update admin password
// @route   PUT /api/v1/admin/auth/password
// @access  Private (Admin)
const updateAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+passwordHash');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match.'
      });
    }

    user.password = newPassword;
    await user.save();

    await recordAudit({
      admin: req.user,
      action: 'change_password',
      targetType: 'Auth',
      targetId: user._id,
      reason: 'Admin updated personal password',
      req
    });

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

// @desc    List all admin users (Super Admin only)
// @route   GET /api/v1/admin/auth/admins
// @access  Private (Super Admin)
const getAdminAccounts = async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('-password').sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: admins,
      admins
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load admin accounts.'
    });
  }
};

// @desc    Create new admin user (Super Admin only)
// @route   POST /api/v1/admin/auth/admins
// @access  Private (Super Admin)
const createAdminAccount = async (req, res) => {
  try {
    const { name, email, phone, password, adminRole = 'operations_admin' } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields.'
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    const newAdmin = await User.create({
      name,
      email,
      phone,
      password,
      role: 'admin',
      adminRole,
      isApproved: true,
      approvalStatus: 'approved'
    });

    await recordAudit({
      admin: req.user,
      action: 'create_admin',
      targetType: 'User',
      targetId: newAdmin._id,
      targetName: newAdmin.name,
      details: { role: adminRole, email: newAdmin.email },
      req
    });

    const sanitized = {
      id: newAdmin._id,
      name: newAdmin.name,
      email: newAdmin.email,
      phone: newAdmin.phone,
      role: newAdmin.role,
      adminRole: newAdmin.adminRole,
      createdAt: newAdmin.createdAt
    };

    return res.status(201).json({
      success: true,
      message: `Admin account created for ${newAdmin.name} (${adminRole}).`,
      data: sanitized,
      admin: sanitized
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to create admin account.'
    });
  }
};

module.exports = {
  loginAdmin,
  getAdminMe,
  updateAdminPassword,
  getAdminAccounts,
  createAdminAccount
};
