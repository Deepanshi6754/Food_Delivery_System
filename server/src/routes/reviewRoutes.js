const express = require('express');
const router = express.Router();
const {
  createReview,
  getRestaurantReviews,
  getMyReviews
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.get('/restaurant/:restaurantId', getRestaurantReviews);
router.post('/', protect, createReview);
router.get('/my', protect, getMyReviews);

module.exports = router;

