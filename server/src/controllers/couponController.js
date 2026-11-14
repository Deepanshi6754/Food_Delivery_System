const Coupon = require('../models/Coupon');

// @desc    Get all available active coupons
// @route   GET /api/coupons
// @access  Public
exports.getAvailableCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).populate('restaurantSpecific', 'name');

    res.status(200).json({
      success: true,
      count: coupons.length,
      data: coupons
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Validate a coupon code
// @route   POST /api/coupons/validate
// @access  Public
exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal = 0, restaurantId } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Please provide coupon code' });
    }

    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
      isActive: true,
      expiresAt: { $gt: new Date() }
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired coupon code.'
      });
    }

    const subtotalPaise = parseInt(subtotal, 10);
    if (subtotalPaise < coupon.minOrderValue) {
      const minRs = Math.round(coupon.minOrderValue / 100);
      return res.status(400).json({
        success: false,
        message: `This coupon requires a minimum order of ₹${minRs}.`
      });
    }

    if (
      restaurantId &&
      coupon.restaurantSpecific &&
      coupon.restaurantSpecific.length > 0 &&
      !coupon.restaurantSpecific.some((r) => r.toString() === restaurantId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'This coupon is not valid for this restaurant.'
      });
    }

    // Calculate estimated discount
    let discount = 0;
    if (coupon.flatDiscount > 0) {
      discount = coupon.flatDiscount;
    } else if (coupon.discountPercentage > 0) {
      const percentageDiscount = Math.round(
        (subtotalPaise * coupon.discountPercentage) / 100
      );
      discount =
        coupon.maxDiscount > 0
          ? Math.min(percentageDiscount, coupon.maxDiscount)
          : percentageDiscount;
    }

    res.status(200).json({
      success: true,
      message: `Coupon "${coupon.code}" is valid!`,
      data: {
        coupon,
        discount
      }
    });
  } catch (err) {
    next(err);
  }
};

