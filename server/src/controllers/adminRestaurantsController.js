const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const Review = require('../models/Review');
const { recordAudit } = require('../middleware/adminAuth');

// @desc    Get paginated restaurants with filters
// @route   GET /api/v1/admin/restaurants
// @access  Private (Admin - Operations/Finance/Super)
const getRestaurants = async (req, res) => {
  try {
    const {
      search = '',
      approvalStatus = 'all',
      isSuspended,
      cuisine = '',
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = req.query;

    const query = {};

    if (approvalStatus !== 'all') {
      query.approvalStatus = approvalStatus;
    }

    if (isSuspended !== undefined && isSuspended !== '') {
      query.isSuspended = isSuspended === 'true';
    }

    if (cuisine.trim()) {
      query.cuisines = { $in: [new RegExp(cuisine.trim(), 'i')] };
    }

    if (search.trim()) {
      const reg = new RegExp(search.trim(), 'i');
      query.$or = [{ name: reg }, { 'contact.email': reg }, { 'contact.phone': reg }, { 'address.city': reg }];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [total, restaurants] = await Promise.all([
      Restaurant.countDocuments(query),
      Restaurant.find(query)
        .populate('owner', 'name email phone')
        .sort(sort)
        .skip(skip)
        .limit(take)
        .lean()
    ]);

    // Enhance with order counts and dish counts
    const restIds = restaurants.map((r) => r._id);
    const [dishCounts, orderCounts] = await Promise.all([
      MenuItem.aggregate([
        { $match: { restaurant: { $in: restIds } } },
        { $group: { _id: '$restaurant', totalDishes: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: { restaurant: { $in: restIds } } },
        {
          $group: {
            _id: '$restaurant',
            totalOrders: { $sum: 1 },
            grossRevenue: {
              $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, '$pricing.total', 0] }
            }
          }
        }
      ])
    ]);

    const dishMap = {};
    dishCounts.forEach((d) => (dishMap[String(d._id)] = d.totalDishes));

    const orderMap = {};
    orderCounts.forEach((o) => (orderMap[String(o._id)] = o));

    const enriched = restaurants.map((r) => {
      const orders = orderMap[String(r._id)] || { totalOrders: 0, grossRevenue: 0 };
      return {
        ...r,
        totalDishes: dishMap[String(r._id)] || 0,
        totalOrders: orders.totalOrders,
        grossRevenue: orders.grossRevenue
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        restaurants: enriched,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / take) || 1,
          limit: take
        }
      }
    });
  } catch (err) {
    console.error('Error getting restaurants:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve restaurants.'
    });
  }
};

// @desc    Get detailed restaurant profile
// @route   GET /api/v1/admin/restaurants/:id
// @access  Private (Admin)
const getRestaurantDetails = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .populate('owner', 'name email phone avatar createdAt')
      .lean();

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found.'
      });
    }

    const [menuItems, recentOrders, reviews] = await Promise.all([
      MenuItem.find({ restaurant: restaurant._id }).sort({ category: 1, name: 1 }).lean(),
      Order.find({ restaurant: restaurant._id })
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Review.find({ restaurant: restaurant._id })
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
    ]);

    return res.status(200).json({
      success: true,
      data: {
        restaurant,
        menuItems,
        recentOrders,
        reviews
      }
    });
  } catch (err) {
    console.error('Error fetching restaurant details:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve restaurant details.'
    });
  }
};

// @desc    Approve or reject restaurant onboarding
// @route   PATCH /api/v1/admin/restaurants/:id/approval
// @access  Private (Admin - Operations/Super)
const updateRestaurantApproval = async (req, res) => {
  try {
    const { status, reason = '' } = req.body; // 'approved' | 'rejected'

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid approval status. Must be approved, rejected, or pending.'
      });
    }

    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found.'
      });
    }

    const oldStatus = restaurant.approvalStatus;
    restaurant.approvalStatus = status;
    if (status === 'approved') {
      restaurant.isActive = true;
    } else if (status === 'rejected') {
      restaurant.isActive = false;
    }
    await restaurant.save();

    await recordAudit({
      admin: req.user,
      action: `restaurant_${status}`,
      targetType: 'Restaurant',
      targetId: restaurant._id,
      targetName: restaurant.name,
      reason: reason || `Restaurant status updated to ${status}`,
      details: {
        previousStatus: oldStatus,
        newStatus: status
      },
      req
    });

    return res.status(200).json({
      success: true,
      message: `Restaurant has been ${status}.`,
      data: restaurant
    });
  } catch (err) {
    console.error('Error updating restaurant approval:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update restaurant approval status.'
    });
  }
};

// @desc    Toggle restaurant suspension
// @route   PATCH /api/v1/admin/restaurants/:id/suspend
// @access  Private (Admin - Operations/Super)
const toggleRestaurantSuspension = async (req, res) => {
  try {
    const { isSuspended, reason = '' } = req.body;
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found.'
      });
    }

    const prev = restaurant.isSuspended || false;
    restaurant.isSuspended = isSuspended !== undefined ? Boolean(isSuspended) : !prev;
    restaurant.suspensionReason = restaurant.isSuspended ? reason || 'Administrative suspension' : '';
    await restaurant.save();

    await recordAudit({
      admin: req.user,
      action: restaurant.isSuspended ? 'suspend_restaurant' : 'reactivate_restaurant',
      targetType: 'Restaurant',
      targetId: restaurant._id,
      targetName: restaurant.name,
      reason: reason || (restaurant.isSuspended ? 'Restaurant suspended' : 'Restaurant reactivated'),
      details: {
        previousStatus: prev,
        newStatus: restaurant.isSuspended,
        reason: restaurant.suspensionReason
      },
      req
    });

    return res.status(200).json({
      success: true,
      message: restaurant.isSuspended ? 'Restaurant has been suspended.' : 'Restaurant has been reactivated.',
      data: restaurant
    });
  } catch (err) {
    console.error('Error toggling restaurant suspension:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update restaurant suspension status.'
    });
  }
};

// @desc    Update restaurant platform commission percentage
// @route   PATCH /api/v1/admin/restaurants/:id/commission
// @access  Private (Admin - Finance/Super)
const updateRestaurantCommission = async (req, res) => {
  try {
    const { commissionRate } = req.body; // e.g. 18 = 18%

    if (commissionRate === undefined || commissionRate < 0 || commissionRate > 100) {
      return res.status(400).json({
        success: false,
        message: 'Commission rate must be a number between 0 and 100.'
      });
    }

    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found.'
      });
    }

    const oldCommission = restaurant.platformCommission;
    restaurant.platformCommission = Number(commissionRate);
    await restaurant.save();

    await recordAudit({
      admin: req.user,
      action: 'update_restaurant_commission',
      targetType: 'Restaurant',
      targetId: restaurant._id,
      targetName: restaurant.name,
      reason: `Commission rate changed from ${oldCommission}% to ${commissionRate}%`,
      details: {
        oldRate: oldCommission,
        newRate: commissionRate
      },
      req
    });

    return res.status(200).json({
      success: true,
      message: `Commission updated to ${commissionRate}%.`,
      data: {
        id: restaurant._id,
        platformCommission: restaurant.platformCommission
      }
    });
  } catch (err) {
    console.error('Error updating restaurant commission:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update commission rate.'
    });
  }
};

// @desc    Toggle restaurant promoted/featured badge
// @route   PATCH /api/v1/admin/restaurants/:id/promoted
// @access  Private (Admin)
const updateRestaurantFeatured = async (req, res) => {
  try {
    const { isPromoted } = req.body;
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found.'
      });
    }

    restaurant.isPromoted = Boolean(isPromoted);
    await restaurant.save();

    return res.status(200).json({
      success: true,
      message: restaurant.isPromoted ? 'Restaurant marked as featured.' : 'Featured status removed.',
      data: restaurant
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update featured status.'
    });
  }
};

module.exports = {
  getRestaurants,
  getRestaurantDetails,
  updateRestaurantApproval,
  toggleRestaurantSuspension,
  updateRestaurantCommission,
  updateRestaurantFeatured
};
