const express = require('express');
const router = express.Router();
const {
  getAvailableCoupons,
  validateCoupon
} = require('../controllers/couponController');

router.get('/', getAvailableCoupons);
router.post('/validate', validateCoupon);

module.exports = router;

