const AuditLog = require('../models/AuditLog');

// @desc    Get paginated immutable audit logs
// @route   GET /api/v1/admin/audit-logs
// @access  Private (Admin - Super Admin / Operations Admin)
const getAuditLogs = async (req, res) => {
  try {
    const {
      search = '',
      action,
      targetType,
      adminRole,
      startDate,
      endDate,
      page = 1,
      limit = 15,
      sort = '-createdAt'
    } = req.query;

    const query = {};

    if (action) {
      query.action = action;
    }

    if (targetType) {
      query.targetType = targetType;
    }

    if (adminRole) {
      query.adminRole = adminRole;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    if (search.trim()) {
      const reg = new RegExp(search.trim(), 'i');
      query.$or = [{ adminName: reg }, { adminEmail: reg }, { targetName: reg }, { reason: reg }, { action: reg }];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [total, logs] = await Promise.all([
      AuditLog.countDocuments(query),
      AuditLog.find(query)
        .sort(sort)
        .skip(skip)
        .limit(take)
        .lean()
    ]);

    return res.status(200).json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / take) || 1,
          limit: take
        }
      }
    });
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve audit logs.'
    });
  }
};

module.exports = {
  getAuditLogs
};
