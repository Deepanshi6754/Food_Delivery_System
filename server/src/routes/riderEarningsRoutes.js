const express = require('express');
const router = express.Router();
const { protectRider, attachRiderProfile } = require('../middleware/riderAuth');
const { getEarningsSummary, requestWithdrawal } = require('../controllers/riderEarningsController');

// GET /api/v1/rider/earnings/summary
router.get('/summary', protectRider, attachRiderProfile, getEarningsSummary);

// POST /api/v1/rider/earnings/withdraw
router.post('/withdraw', protectRider, attachRiderProfile, requestWithdrawal);

module.exports = router;
