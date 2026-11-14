const Review = require('../models/Review');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');

// @desc    Create review for delivered order
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res, next) => {
  try {
    const { orderId, rating, foodRating = 5, comment, photos = [] } = req.body;

    if (!orderId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide rating, review comment, and valid orderId.'
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or unauthorized.'
      });
    }

    if (order.orderStatus !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Only delivered orders can be reviewed.'
      });
    }

    if (order.isReviewed) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this order.'
      });
    }

    const review = await Review.create({
      user: {
        id: req.user._id,
        name: req.user.name,
        avatar: req.user.avatar
      },
      restaurant: order.restaurant.id,
      order: order._id,
      rating: Number(rating),
      foodRating: Number(foodRating),
      comment: comment.trim(),
      photos,
      isVerified: true
    });

    order.isReviewed = true;
    await order.save();

    // Recalculate restaurant rating
    const allReviews = await Review.find({ restaurant: order.restaurant.id });
    const avgRating =
      allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;

    await Restaurant.findByIdAndUpdate(order.restaurant.id, {
      rating: parseFloat(avgRating.toFixed(1)),
      reviewCount: allReviews.length
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your valuable review!',
      data: review
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get reviews for a restaurant
// @route   GET /api/reviews/restaurant/:restaurantId
// @access  Public
exports.getRestaurantReviews = async (req, res, next) => {
  try {
    let restaurantId = req.params.restaurantId;
    if (!restaurantId.match(/^[0-9a-fA-F]{24}$/)) {
      const rest = await Restaurant.findOne({ slug: restaurantId });
      if (!rest) {
        return res.status(200).json({ success: true, count: 0, data: [] });
      }
      restaurantId = rest._id;
    }

    const reviews = await Review.find({ restaurant: restaurantId })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user reviews
// @route   GET /api/reviews/my
// @access  Private
exports.getMyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ 'user.id': req.user._id })
      .populate('restaurant', 'name slug image')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (err) {
    next(err);
  }
};
