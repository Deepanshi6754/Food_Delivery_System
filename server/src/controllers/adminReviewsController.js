const Review = require('../models/Review');
const { recordAudit } = require('../middleware/adminAuth');

// @desc    Get paginated platform reviews with filtering
// @route   GET /api/v1/admin/reviews
// @access  Private (Admin - Support/Operations/Super)
const getReviews = async (req, res) => {
  try {
    const { rating, status = 'all', search = '', page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const query = {};

    if (rating) {
      query.rating = Number(rating);
    }

    if (status !== 'all') {
      query.status = status;
    }

    if (search.trim()) {
      const reg = new RegExp(search.trim(), 'i');
      query.comment = reg;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [total, reviews] = await Promise.all([
      Review.countDocuments(query),
      Review.find(query)
        .populate('user', 'name email avatar')
        .populate('restaurant', 'name logo')
        .populate('order', 'orderNumber')
        .sort(sort)
        .skip(skip)
        .limit(take)
        .lean()
    ]);

    return res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / take) || 1,
          limit: take
        }
      }
    });
  } catch (err) {
    console.error('Error fetching admin reviews:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve reviews.'
    });
  }
};

// @desc    Moderate a review (visible / hidden / flagged)
// @route   PATCH /api/v1/admin/reviews/:id/moderate
// @access  Private (Admin - Support/Operations/Super)
const moderateReview = async (req, res) => {
  try {
    const { status, reason = '' } = req.body; // 'visible' | 'hidden' | 'flagged'

    if (!['visible', 'hidden', 'flagged'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review status. Must be visible, hidden, or flagged.'
      });
    }

    const review = await Review.findById(req.params.id)
      .populate('restaurant', 'name')
      .populate('user', 'name');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.'
      });
    }

    const prevStatus = review.status || 'visible';
    review.status = status;
    review.moderationReason = reason;
    await review.save();

    await recordAudit({
      admin: req.user,
      action: `moderate_review_${status}`,
      targetType: 'Review',
      targetId: review._id,
      targetName: `Review by ${review.user?.name || 'User'} on ${review.restaurant?.name || 'Restaurant'}`,
      reason: reason || `Status set to ${status}`,
      details: {
        rating: review.rating,
        comment: review.comment,
        previousStatus: prevStatus,
        newStatus: status
      },
      req
    });

    return res.status(200).json({
      success: true,
      message: `Review marked as ${status}.`,
      data: review
    });
  } catch (err) {
    console.error('Error moderating review:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to moderate review.'
    });
  }
};

module.exports = {
  getReviews,
  moderateReview
};
