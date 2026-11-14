const express = require('express');
const router = express.Router();
const { protectRider } = require('../middleware/riderAuth');
const Notification = require('../models/Notification');

// GET / - get rider notifications
router.get('/', protectRider, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
    res.json({ success: true, data: notifications, unreadCount });
  } catch(err) { next(err); }
});

// PATCH /read - mark all as read
router.patch('/read', protectRider, async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch(err) { next(err); }
});

module.exports = router;
