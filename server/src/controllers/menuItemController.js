const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

// @desc    Search menu items across restaurants
// @route   GET /api/menu-items/search
// @access  Public
exports.searchMenuItems = async (req, res, next) => {
  try {
    const {
      q,
      category,
      isVeg,
      isVegan,
      isJain,
      sort,
      page = 1,
      limit = 16
    } = req.query;

    const query = { available: true };

    if (q && q.trim()) {
      query.$or = [
        { name: { $regex: q.trim(), $options: 'i' } },
        { description: { $regex: q.trim(), $options: 'i' } },
        { category: { $regex: q.trim(), $options: 'i' } }
      ];
    }

    if (category && category !== 'All') {
      query.category = { $regex: category, $options: 'i' };
    }

    if (isVeg === 'true') {
      query.isVeg = true;
    }

    if (isVegan === 'true') {
      query.isVegan = true;
    }

    if (isJain === 'true') {
      query.isJain = true;
    }

    let sortOption = { isBestseller: -1, rating: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'rating_desc') sortOption = { rating: -1 };

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 16;
    const skip = (pageNum - 1) * limitNum;

    const total = await MenuItem.countDocuments(query);
    const items = await MenuItem.find(query)
      .populate('restaurant', 'name slug image rating deliveryTime deliveryFee isOpen')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: items.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: items
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get trending and bestselling dishes
// @route   GET /api/menu-items/trending
// @access  Public
exports.getTrendingDishes = async (req, res, next) => {
  try {
    const dishes = await MenuItem.find({ available: true, isBestseller: true })
      .populate('restaurant', 'name slug image rating deliveryTime deliveryFee isOpen')
      .sort({ rating: -1, reviewCount: -1 })
      .limit(8);

    res.status(200).json({
      success: true,
      data: dishes
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single menu item by ID
// @route   GET /api/menu-items/:id
// @access  Public
exports.getMenuItemById = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id).populate(
      'restaurant',
      'name slug image rating deliveryTime deliveryFee isOpen minOrderValue'
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (err) {
    next(err);
  }
};

