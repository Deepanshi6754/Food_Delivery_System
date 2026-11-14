const Coupon = require('../models/Coupon');
const { recordAudit } = require('../middleware/adminAuth');

// @desc    Get all coupons (Platform & Restaurant)
// @route   GET /api/v1/admin/coupons
// @access  Private (Admin - Operations/Finance/Super)
const getCoupons = async (req, res) => {
  try {
    const { search = '', status = 'all' } = req.query;

    const query = {};

    if (status === 'active') {
      query.isActive = true;
      query.validUntil = { $gte: new Date() };
    } else if (status === 'expired') {
      query.$or = [{ isActive: false }, { validUntil: { $lt: new Date() } }];
    }

    if (search.trim()) {
      const reg = new RegExp(search.trim(), 'i');
      query.$or = [{ code: reg }, { description: reg }];
    }

    const coupons = await Coupon.find(query)
      .populate('restaurant', 'name')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: coupons
    });
  } catch (err) {
    console.error('Error fetching coupons:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve coupons.'
    });
  }
};

// @desc    Create platform-wide or restaurant coupon
// @route   POST /api/v1/admin/coupons
// @access  Private (Admin - Operations/Finance/Super)
const createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountAmount,
      minOrderAmount = 0,
      maxDiscountAmount,
      validFrom,
      validUntil,
      usageLimit = 1000,
      restaurant = null,
      isActive = true
    } = req.body;

    if (!code || !discountType || discountAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Code, discount type, and discount amount are required.'
      });
    }

    const upperCode = code.trim().toUpperCase();
    const existing = await Coupon.findOne({ code: upperCode });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Coupon code '${upperCode}' already exists.`
      });
    }

    const coupon = await Coupon.create({
      code: upperCode,
      description: description || '',
      discountType,
      discountAmount: Number(discountAmount),
      minOrderAmount: Number(minOrderAmount) || 0,
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
      validFrom: validFrom ? new Date(validFrom) : new Date(),
      validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      usageLimit: Number(usageLimit) || 1000,
      usedCount: 0,
      restaurant: restaurant || null,
      isActive: Boolean(isActive)
    });

    await recordAudit({
      admin: req.user,
      action: 'create_coupon',
      targetType: 'Coupon',
      targetId: coupon._id,
      targetName: coupon.code,
      reason: 'Admin created new coupon promotion',
      details: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountAmount: coupon.discountAmount
      },
      req
    });

    return res.status(201).json({
      success: true,
      message: `Coupon ${coupon.code} created successfully.`,
      data: coupon
    });
  } catch (err) {
    console.error('Error creating coupon:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to create coupon.'
    });
  }
};

// @desc    Update coupon
// @route   PUT /api/v1/admin/coupons/:id
// @access  Private (Admin - Operations/Finance/Super)
const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found.'
      });
    }

    const fields = [
      'description',
      'discountType',
      'discountAmount',
      'minOrderAmount',
      'maxDiscountAmount',
      'validFrom',
      'validUntil',
      'usageLimit',
      'isActive'
    ];

    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        coupon[f] = req.body[f];
      }
    });

    if (req.body.code) {
      coupon.code = req.body.code.trim().toUpperCase();
    }

    await coupon.save();

    await recordAudit({
      admin: req.user,
      action: 'update_coupon',
      targetType: 'Coupon',
      targetId: coupon._id,
      targetName: coupon.code,
      reason: 'Coupon details updated',
      details: req.body,
      req
    });

    return res.status(200).json({
      success: true,
      message: 'Coupon updated successfully.',
      data: coupon
    });
  } catch (err) {
    console.error('Error updating coupon:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update coupon.'
    });
  }
};

// @desc    Delete coupon
// @route   DELETE /api/v1/admin/coupons/:id
// @access  Private (Admin - Operations/Finance/Super)
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found.'
      });
    }

    const code = coupon.code;
    await Coupon.findByIdAndDelete(req.params.id);

    await recordAudit({
      admin: req.user,
      action: 'delete_coupon',
      targetType: 'Coupon',
      targetId: req.params.id,
      targetName: code,
      reason: 'Coupon deleted by admin',
      req
    });

    return res.status(200).json({
      success: true,
      message: `Coupon ${code} deleted successfully.`
    });
  } catch (err) {
    console.error('Error deleting coupon:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete coupon.'
    });
  }
};

module.exports = {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon
};
