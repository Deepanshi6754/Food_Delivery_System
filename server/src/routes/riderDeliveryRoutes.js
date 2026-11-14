const express = require('express');
const router = express.Router();
const { protectRider, attachRiderProfile } = require('../middleware/riderAuth');
const {
  getAvailableRequests,
  acceptDelivery,
  rejectDelivery,
  getActiveDelivery,
  updateDeliveryStage
} = require('../controllers/riderDeliveriesController');

// GET /api/v1/rider/deliveries/requests
router.get('/requests', protectRider, attachRiderProfile, getAvailableRequests);

// GET /api/v1/rider/deliveries/active
router.get('/active', protectRider, attachRiderProfile, getActiveDelivery);

// PUT /api/v1/rider/deliveries/active/stage
router.put('/active/stage', protectRider, attachRiderProfile, updateDeliveryStage);

// POST /api/v1/rider/deliveries/:assignmentId/accept
router.post('/:assignmentId/accept', protectRider, attachRiderProfile, acceptDelivery);

// POST /api/v1/rider/deliveries/:assignmentId/reject
router.post('/:assignmentId/reject', protectRider, attachRiderProfile, rejectDelivery);

module.exports = router;
