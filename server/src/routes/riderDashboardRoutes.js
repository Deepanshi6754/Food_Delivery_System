const express = require('express');
const router = express.Router();
const { protectRider, attachRiderProfile } = require('../middleware/riderAuth');
const { getDashboardOverview } = require('../controllers/riderDashboardController');

// GET /api/v1/rider/dashboard/overview
router.get('/overview', protectRider, attachRiderProfile, getDashboardOverview);

module.exports = router;
