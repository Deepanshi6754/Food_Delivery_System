const express = require('express');
const router = express.Router();
const {
  getReviews,
  replyToReview,
  reportReview
} = require('../controllers/ownerReviewsController');
const { protectOwner, attachRestaurant } = require('../middleware/ownerAuth');

router.use(protectOwner, attachRestaurant);

router.get('/', getReviews);
router.post('/:id/reply', replyToReview);
router.post('/:id/report', reportReview);

module.exports = router;

