const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    adminName: {
      type: String,
      required: true
    },
    adminEmail: {
      type: String,
      required: true
    },
    adminRole: {
      type: String,
      enum: ['super_admin', 'operations_admin', 'finance_admin', 'support_admin'],
      default: 'super_admin',
      index: true
    },
    action: {
      type: String,
      required: true,
      index: true
    },
    targetType: {
      type: String,
      enum: [
        'User',
        'Customer',
        'Restaurant',
        'Rider',
        'Order',
        'Payment',
        'Refund',
        'Payout',
        'Coupon',
        'Category',
        'MenuItem',
        'Review',
        'SupportTicket',
        'Settings',
        'Announcement',
        'Auth'
      ],
      required: true,
      index: true
    },
    targetId: {
      type: String,
      default: ''
    },
    targetName: {
      type: String,
      default: ''
    },
    reason: {
      type: String,
      default: ''
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1'
    }
  },
  {
    timestamps: true
  }
);

auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
