const express = require('express');
const router = express.Router();
const { protectRider, attachRiderProfile } = require('../middleware/riderAuth');
const {
  getProfile,
  updateProfile,
  updateBankDetails
} = require('../controllers/riderProfileController');

// GET /api/v1/rider/profile/
router.get('/', protectRider, attachRiderProfile, getProfile);

// PUT /api/v1/rider/profile/
router.put('/', protectRider, attachRiderProfile, updateProfile);

// PUT /api/v1/rider/profile/bank
router.put('/bank', protectRider, attachRiderProfile, updateBankDetails);

module.exports = router;
