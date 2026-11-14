const express = require('express');
const router = express.Router();
const { protectRider, attachRiderProfile } = require('../middleware/riderAuth');
const { toggleAvailability } = require('../controllers/riderAvailabilityController');

// PATCH /api/v1/rider/availability/toggle
router.patch('/toggle', protectRider, attachRiderProfile, toggleAvailability);

module.exports = router;
