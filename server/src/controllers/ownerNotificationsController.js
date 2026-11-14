const Notification = require('../models/Notification');

// @desc    Get owner notifications
// @route   GET /api/v1/owner/notifications
// @access  Private (Owner)
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user._id
    }).sort({ createdAt: -1 }).limit(30);

    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false
    });

    return res.status(200).json({
      success: true,
      unreadCount,
      notifications
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve notifications.'
    });
  }
};

// @desc    Mark notification(s) as read
// @route   PATCH /api/v1/owner/notifications/read
// @access  Private (Owner)
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.body;

    if (notificationId) {
      await Notification.updateOne(
        { _id: notificationId, user: req.user._id },
        { isRead: true }
      );
    } else {
      // Mark all read
      await Notification.updateMany(
        { user: req.user._id, isRead: false },
        { isRead: true }
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Notification(s) marked as read.'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read.'
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead
};

