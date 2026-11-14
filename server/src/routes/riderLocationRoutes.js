const express = require('express');
const router = express.Router();
const { protectRider, attachRiderProfile } = require('../middleware/riderAuth');
const { updateLocation, getLocation } = require('../controllers/riderLocationController');

// POST /api/v1/rider/location/
router.post('/', protectRider, attachRiderProfile, updateLocation);

// GET /api/v1/rider/location/
router.get('/', protectRider, attachRiderProfile, getLocation);

module.exports = router;
