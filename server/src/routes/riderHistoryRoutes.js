const express = require('express');
const router = express.Router();
const { protectRider, attachRiderProfile } = require('../middleware/riderAuth');
const { getDeliveryHistory, getDeliveryDetails } = require('../controllers/riderHistoryController');

// GET /api/v1/rider/history/
router.get('/', protectRider, attachRiderProfile, getDeliveryHistory);

// GET /api/v1/rider/history/:id
router.get('/:id', protectRider, attachRiderProfile, getDeliveryDetails);

module.exports = router;
