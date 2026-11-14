const Review = require('../models/Review');

// @desc    Get all reviews for owner's restaurant
// @route   GET /api/v1/owner/reviews
// @access  Private (Owner + attachRestaurant)
const getReviews = async (req, res) => {
  try {
    const restaurantId = req.restaurant._id;
    const { rating, hasReply } = req.query;

    const query = { restaurant: restaurantId };

    if (rating && rating !== 'all') {
      query.rating = Number(rating);
    }

    if (hasReply === 'true') {
      query['reply.message'] = { $exists: true, $ne: '' };
    } else if (hasReply === 'false') {
      query.$or = [
        { reply: { $exists: false } },
        { 'reply.message': { $exists: false } },
        { 'reply.message': '' }
      ];
    }

    const reviews = await Review.find(query).sort({ createdAt: -1 });

    // Calculate rating breakdown
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const allReviews = await Review.find({ restaurant: restaurantId });
    allReviews.forEach((r) => {
      const rounded = Math.round(r.rating);
      if (breakdown[rounded] !== undefined) {
        breakdown[rounded]++;
      }
    });

    const averageRating =
      allReviews.length > 0
        ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
        : 4.5;

    return res.status(200).json({
      success: true,
      total: reviews.length,
      averageRating: Number(averageRating),
      breakdown,
      reviews
    });
  } catch (err) {
    console.error('Get reviews error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve customer reviews.'
    });
  }
};

// @desc    Reply to customer review
// @route   POST /api/v1/owner/reviews/:id/reply
// @access  Private (Owner + attachRestaurant)
const replyToReview = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a reply message.'
      });
    }

    const review = await Review.findOne({
      _id: req.params.id,
      restaurant: req.restaurant._id
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or does not belong to your restaurant.'
      });
    }

    review.reply = {
      message: message.trim(),
      repliedAt: new Date()
    };

    await review.save();

    return res.status(200).json({
      success: true,
      message: 'Reply posted successfully.',
      review
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to post reply.'
    });
  }
};

// @desc    Report inappropriate review to admin
// @route   POST /api/v1/owner/reviews/:id/report
// @access  Private (Owner + attachRestaurant)
const reportReview = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason || reason.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a reason for reporting this review.'
      });
    }

    const review = await Review.findOne({
      _id: req.params.id,
      restaurant: req.restaurant._id
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.'
      });
    }

    review.isReported = true;
    review.reportReason = reason;
    await review.save();

    return res.status(200).json({
      success: true,
      message: 'Review reported to admin team for content moderation.',
      review
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to report review.'
    });
  }
};

module.exports = {
  getReviews,
  replyToReview,
  reportReview
};

