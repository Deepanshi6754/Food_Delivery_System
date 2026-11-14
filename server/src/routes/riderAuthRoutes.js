const express = require('express');
const router = express.Router();
const { protectRider } = require('../middleware/riderAuth');
const {
  registerRider,
  loginRider,
  getRiderMe,
  updateRiderPassword
} = require('../controllers/riderAuthController');

// POST /api/v1/rider/auth/register
router.post('/register', registerRider);

// POST /api/v1/rider/auth/login
router.post('/login', loginRider);

// GET /api/v1/rider/auth/me
router.get('/me', protectRider, getRiderMe);

// PUT /api/v1/rider/auth/password
router.put('/password', protectRider, updateRiderPassword);

module.exports = router;
