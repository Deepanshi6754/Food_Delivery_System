const Notification = require('../models/Notification');
const Restaurant = require('../models/Restaurant');
const RiderProfile = require('../models/RiderProfile');
const SupportTicket = require('../models/SupportTicket');
const Refund = require('../models/Refund');
const User = require('../models/User');
const { recordAudit } = require('../middleware/adminAuth');

// @desc    Get real-time operational alerts for admin
// @route   GET /api/v1/admin/notifications/alerts
// @access  Private (Admin)
const getAdminAlerts = async (req, res) => {
  try {
    const [pendingRestaurants, pendingRiders, highPriorityTickets, pendingRefunds] = await Promise.all([
      Restaurant.find({ approvalStatus: 'pending' }).select('name contact createdAt').limit(5).lean(),
      RiderProfile.find({ verificationStatus: 'pending' })
        .populate('user', 'name phone')
        .select('user operatingCity createdAt')
        .limit(5)
        .lean(),
      SupportTicket.find({ status: { $in: ['open', 'in_progress'] }, priority: 'high' })
        .populate('user', 'name')
        .select('ticketNumber subject priority createdAt')
        .limit(5)
        .lean(),
      Refund.find({ status: 'pending' })
        .populate('customer', 'name')
        .select('orderNumber amount reason createdAt')
        .limit(5)
        .lean()
    ]);

    const alerts = [];

    pendingRestaurants.forEach((r) => {
      alerts.push({
        id: `rest-${r._id}`,
        type: 'restaurant_pending',
        level: 'warning',
        title: 'New Restaurant Pending Approval',
        message: `${r.name} has submitted an onboarding request.`,
        link: '/admin/restaurants?approvalStatus=pending',
        createdAt: r.createdAt
      });
    });

    pendingRiders.forEach((r) => {
      alerts.push({
        id: `rider-${r._id}`,
        type: 'rider_pending',
        level: 'warning',
        title: 'New Rider Verification Required',
        message: `${r.user?.name || 'Rider'} has registered and needs KYC approval.`,
        link: '/admin/riders?verificationStatus=pending',
        createdAt: r.createdAt
      });
    });

    highPriorityTickets.forEach((t) => {
      alerts.push({
        id: `ticket-${t._id}`,
        type: 'urgent_ticket',
        level: 'danger',
        title: `High Priority Ticket #${t.ticketNumber}`,
        message: t.subject,
        link: `/admin/support?id=${t._id}`,
        createdAt: t.createdAt
      });
    });

    pendingRefunds.forEach((ref) => {
      alerts.push({
        id: `refund-${ref._id}`,
        type: 'pending_refund',
        level: 'info',
        title: `Pending Refund: Order #${ref.orderNumber}`,
        message: `Amount: ₹${(ref.amount / 100).toFixed(2)} - ${ref.reason}`,
        link: '/admin/finance?tab=refunds',
        createdAt: ref.createdAt
      });
    });

    // Sort by newest first
    alerts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({
      success: true,
      data: alerts
    });
  } catch (err) {
    console.error('Error fetching admin alerts:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin alerts.'
    });
  }
};

// @desc    Broadcast announcement to platform users
// @route   POST /api/v1/admin/notifications/broadcast
// @access  Private (Admin - Operations/Super)
const broadcastAnnouncement = async (req, res) => {
  try {
    const { title, message, target = 'all', type = 'system' } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required.'
      });
    }

    const query = {};
    if (target === 'customers') {
      query.role = 'customer';
    } else if (target === 'restaurant_owners') {
      query.role = 'restaurant_owner';
    } else if (target === 'riders') {
      query.role = 'rider';
    }

    const targetUsers = await User.find(query).select('_id');
    const userIds = targetUsers.map((u) => u._id);

    if (userIds.length > 0) {
      const notifications = userIds.map((uid) => ({
        user: uid,
        title: title.trim(),
        message: message.trim(),
        type: 'system',
        read: false
      }));

      await Notification.insertMany(notifications);
    }

    await recordAudit({
      admin: req.user,
      action: 'broadcast_announcement',
      targetType: 'Announcement',
      targetName: title,
      reason: `Broadcast announcement to ${target} (${userIds.length} recipients)`,
      details: { title, target, recipientCount: userIds.length },
      req
    });

    return res.status(200).json({
      success: true,
      message: `Announcement broadcast successfully to ${userIds.length} recipients.`,
      data: {
        title,
        target,
        recipientCount: userIds.length
      }
    });
  } catch (err) {
    console.error('Error broadcasting announcement:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to broadcast announcement.'
    });
  }
};

module.exports = {
  getAdminAlerts,
  broadcastAnnouncement
};
