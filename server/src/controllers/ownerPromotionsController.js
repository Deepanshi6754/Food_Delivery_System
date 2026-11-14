const Coupon = require('../models/Coupon');

// @desc    Get promotions and coupons for owner's restaurant
// @route   GET /api/v1/owner/promotions
// @access  Private (Owner + attachRestaurant)
const getPromotions = async (req, res) => {
  try {
    const restaurantId = req.restaurant._id;

    // Fetch coupons specific to this restaurant or created by this owner
    const coupons = await Coupon.find({
      $or: [
        { restaurantSpecific: restaurantId },
        { createdBy: req.user._id }
      ]
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: coupons.length,
      promotions: coupons
    });
  } catch (err) {
    console.error('Get promotions error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve restaurant promotions.'
    });
  }
};

// @desc    Create a new promotion for owner's restaurant
// @route   POST /api/v1/owner/promotions
// @access  Private (Owner + attachRestaurant)
const createPromotion = async (req, res) => {
  try {
    const {
      code,
      description,
      discountPercentage,
      maxDiscount, // paise
      flatDiscount, // paise
      minOrderValue, // paise
      expiresAt,
      usageLimit
    } = req.body;

    if (!code || !description || !expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'Please provide promo code, description, and expiry date.'
      });
    }

    const cleanCode = code.toUpperCase().trim();

    // Check for duplicate code
    const existing = await Coupon.findOne({ code: cleanCode });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Promotion code "${cleanCode}" is already in use.`
      });
    }

    const newCoupon = await Coupon.create({
      code: cleanCode,
      description,
      discountPercentage: discountPercentage ? Number(discountPercentage) : 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : 0,
      flatDiscount: flatDiscount ? Number(flatDiscount) : 0,
      minOrderValue: minOrderValue ? Number(minOrderValue) : 0,
      expiresAt: new Date(expiresAt),
      usageLimit: usageLimit ? Number(usageLimit) : 1000,
      isActive: true,
      restaurantSpecific: [req.restaurant._id],
      createdBy: req.user._id,
      isPlatformWide: false
    });

    return res.status(201).json({
      success: true,
      message: `Promo code "${cleanCode}" created successfully.`,
      promotion: newCoupon
    });
  } catch (err) {
    console.error('Create promotion error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to create promotion.'
    });
  }
};

// @desc    Update a restaurant promotion
// @route   PUT /api/v1/owner/promotions/:id
// @access  Private (Owner + attachRestaurant)
const updatePromotion = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found.'
      });
    }

    // Safety guard: cannot modify platform-wide coupon
    if (coupon.isPlatformWide) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Restaurant owners cannot modify platform-wide promotions.'
      });
    }

    // Check ownership
    const isOwnerCoupon =
      coupon.createdBy?.toString() === req.user._id.toString() ||
      coupon.restaurantSpecific?.some((id) => id.toString() === req.restaurant._id.toString());

    if (!isOwnerCoupon) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This promotion does not belong to your restaurant.'
      });
    }

    const {
      description,
      discountPercentage,
      maxDiscount,
      flatDiscount,
      minOrderValue,
      expiresAt,
      usageLimit,
      isActive
    } = req.body;

    if (description) coupon.description = description;
    if (discountPercentage !== undefined) coupon.discountPercentage = Number(discountPercentage);
    if (maxDiscount !== undefined) coupon.maxDiscount = Number(maxDiscount);
    if (flatDiscount !== undefined) coupon.flatDiscount = Number(flatDiscount);
    if (minOrderValue !== undefined) coupon.minOrderValue = Number(minOrderValue);
    if (expiresAt) coupon.expiresAt = new Date(expiresAt);
    if (usageLimit !== undefined) coupon.usageLimit = Number(usageLimit);
    if (isActive !== undefined) coupon.isActive = Boolean(isActive);

    await coupon.save();

    return res.status(200).json({
      success: true,
      message: 'Promotion updated successfully.',
      promotion: coupon
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update promotion.'
    });
  }
};

// @desc    Delete a restaurant promotion
// @route   DELETE /api/v1/owner/promotions/:id
// @access  Private (Owner + attachRestaurant)
const deletePromotion = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found.'
      });
    }

    if (coupon.isPlatformWide) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Cannot delete platform-wide promotions.'
      });
    }

    const isOwnerCoupon =
      coupon.createdBy?.toString() === req.user._id.toString() ||
      coupon.restaurantSpecific?.some((id) => id.toString() === req.restaurant._id.toString());

    if (!isOwnerCoupon) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this promotion.'
      });
    }

    await Coupon.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Promotion removed successfully.'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete promotion.'
    });
  }
};

module.exports = {
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion
};

