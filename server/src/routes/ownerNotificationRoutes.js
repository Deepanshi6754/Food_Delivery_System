const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead
} = require('../controllers/ownerNotificationsController');
const { protectOwner } = require('../middleware/ownerAuth');

router.use(protectOwner);

router.get('/', getNotifications);
router.patch('/read', markAsRead);

module.exports = router;

