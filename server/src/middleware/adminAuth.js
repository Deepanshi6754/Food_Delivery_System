const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

/**
 * Protect routes - only authenticated administrators
 */
const protectAdmin = async (req, res, next) => {
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
        message: 'Admin authorization token required.'
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
        message: 'Administrator account not found.'
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Administrator privileges required.'
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: `Admin account is suspended: ${user.suspensionReason || 'Contact Super Admin'}`
      });
    }

    req.user = user;
    req.adminRole = user.adminRole || 'super_admin';
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired admin session token.'
    });
  }
};

/**
 * Role-Based Access Control
 * e.g. requireAdminRole('super_admin', 'operations_admin')
 */
const requireAdminRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const currentRole = req.user.adminRole || 'super_admin';

    // Super Admin has universal access
    if (currentRole === 'super_admin') {
      return next();
    }

    if (!allowedRoles.includes(currentRole)) {
      return res.status(403).json({
        success: false,
        message: `Permission denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${currentRole}`
      });
    }

    next();
  };
};

/**
 * Audit log recording helper
 */
const recordAudit = async ({
  admin,
  action,
  targetType,
  targetId = '',
  targetName = '',
  reason = '',
  details = {},
  req
}) => {
  try {
    const ip = req?.headers['x-forwarded-for'] || req?.socket?.remoteAddress || '127.0.0.1';
    await AuditLog.create({
      admin: admin._id,
      adminName: admin.name,
      adminEmail: admin.email,
      adminRole: admin.adminRole || 'super_admin',
      action,
      targetType,
      targetId: String(targetId || ''),
      targetName: String(targetName || ''),
      reason,
      details,
      ipAddress: String(ip)
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
};

module.exports = {
  protectAdmin,
  requireAdminRole,
  recordAudit
};
