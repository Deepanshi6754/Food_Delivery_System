const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const { recordAudit } = require('../middleware/adminAuth');

// @desc    Get paginated menu items across all restaurants
// @route   GET /api/v1/admin/menu
// @access  Private (Admin - Operations/Super)
const getMenuItems = async (req, res) => {
  try {
    const {
      search = '',
      restaurantId,
      category,
      moderationStatus = 'all',
      isAvailable,
      page = 1,
      limit = 12,
      sort = '-createdAt'
    } = req.query;

    const query = {};

    if (moderationStatus !== 'all') {
      query.moderationStatus = moderationStatus;
    }

    if (restaurantId) {
      query.restaurant = restaurantId;
    }

    if (category) {
      query.category = category;
    }

    if (isAvailable !== undefined && isAvailable !== '') {
      query.isAvailable = isAvailable === 'true';
    }

    if (search.trim()) {
      const reg = new RegExp(search.trim(), 'i');
      query.$or = [{ name: reg }, { description: reg }, { category: reg }];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [total, items] = await Promise.all([
      MenuItem.countDocuments(query),
      MenuItem.find(query)
        .populate('restaurant', 'name logo address')
        .sort(sort)
        .skip(skip)
        .limit(take)
        .lean()
    ]);

    return res.status(200).json({
      success: true,
      data: {
        items,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / take) || 1,
          limit: take
        }
      }
    });
  } catch (err) {
    console.error('Error fetching admin menu items:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve menu items.'
    });
  }
};

// @desc    Moderate a menu item (active / flagged / banned)
// @route   PATCH /api/v1/admin/menu/:id/moderate
// @access  Private (Admin - Operations/Super)
const moderateMenuItem = async (req, res) => {
  try {
    const { moderationStatus, reason = '' } = req.body; // 'active' | 'flagged' | 'banned'

    if (!['active', 'flagged', 'banned'].includes(moderationStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid moderation status. Must be active, flagged, or banned.'
      });
    }

    const item = await MenuItem.findById(req.params.id).populate('restaurant', 'name');
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found.'
      });
    }

    const prevStatus = item.moderationStatus || 'active';
    item.moderationStatus = moderationStatus;
    item.isFlagged = moderationStatus === 'flagged' || moderationStatus === 'banned';
    item.moderationReason = reason;

    // If banned, make it unavailable
    if (moderationStatus === 'banned') {
      item.isAvailable = false;
    }

    await item.save();

    await recordAudit({
      admin: req.user,
      action: `moderate_menu_item_${moderationStatus}`,
      targetType: 'MenuItem',
      targetId: item._id,
      targetName: `${item.name} (${item.restaurant?.name || 'Restaurant'})`,
      reason: reason || `Status set to ${moderationStatus}`,
      details: {
        dishName: item.name,
        restaurant: item.restaurant?._id,
        previousStatus: prevStatus,
        newStatus: moderationStatus
      },
      req
    });

    return res.status(200).json({
      success: true,
      message: `Menu item status updated to ${moderationStatus}.`,
      data: item
    });
  } catch (err) {
    console.error('Error moderating menu item:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to moderate menu item.'
    });
  }
};

module.exports = {
  getMenuItems,
  moderateMenuItem
};
