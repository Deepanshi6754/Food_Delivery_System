const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');

// @desc    Get all restaurants with search, filters, sorting & pagination
// @route   GET /api/restaurants
// @access  Public
exports.getAllRestaurants = async (req, res, next) => {
  try {
    const {
      search,
      cuisine,
      vegOnly,
      rating,
      priceMax,
      deliveryMax,
      hasOffers,
      isOpen,
      sort,
      page = 1,
      limit = 12
    } = req.query;

    const query = {};

    // Search by name or cuisine
    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { cuisine: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    // Cuisine filter
    if (cuisine && cuisine !== 'All') {
      const cuisineList = cuisine.split(',').map((c) => c.trim());
      query.cuisine = { $in: cuisineList };
    }

    // Veg Only filter
    if (vegOnly === 'true') {
      query.isPureVeg = true;
    }

    // Rating filter (e.g., 4.0+)
    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
    }

    // Price for two filter (max in rupees or paise)
    if (priceMax) {
      const maxPaise = parseInt(priceMax) * 100;
      query.priceForTwo = { $lte: maxPaise };
    }

    // Delivery time filter (e.g. <= 30 mins)
    if (deliveryMax) {
      query.deliveryTimeMinutes = { $lte: parseInt(deliveryMax) };
    }

    // Has offers
    if (hasOffers === 'true') {
      query.offers = { $exists: true, $not: { $size: 0 } };
    }

    // Is open
    if (isOpen === 'true') {
      query.isOpen = true;
    }

    // Sorting
    let sortOption = { rating: -1 }; // default: highest rated
    if (sort === 'rating_desc') {
      sortOption = { rating: -1, reviewCount: -1 };
    } else if (sort === 'popular') {
      sortOption = { reviewCount: -1, rating: -1 };
    } else if (sort === 'delivery_fastest') {
      sortOption = { deliveryTimeMinutes: 1 };
    } else if (sort === 'price_asc') {
      sortOption = { priceForTwo: 1 };
    } else if (sort === 'price_desc') {
      sortOption = { priceForTwo: -1 };
    }

    // Pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const total = await Restaurant.countDocuments(query);
    const restaurants = await Restaurant.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: restaurants.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: restaurants
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single restaurant by ID or slug with menu items
// @route   GET /api/restaurants/:id
// @access  Public
exports.getRestaurantById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let restaurant;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      restaurant = await Restaurant.findById(id);
    } else {
      restaurant = await Restaurant.findOne({ slug: id });
    }

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Fetch categorized menu items for this restaurant
    const menuItems = await MenuItem.find({
      restaurant: restaurant._id,
      available: true
    });

    // Group menu items by category
    const categoriesMap = {};
    menuItems.forEach((item) => {
      if (!categoriesMap[item.category]) {
        categoriesMap[item.category] = [];
      }
      categoriesMap[item.category].push(item);
    });

    const menuByCategory = Object.keys(categoriesMap).map((catName) => ({
      category: catName,
      items: categoriesMap[catName]
    }));

    res.status(200).json({
      success: true,
      data: {
        restaurant,
        menuByCategory,
        totalMenuItems: menuItems.length
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get homepage curated restaurants (Featured, Top Rated, Offers)
// @route   GET /api/restaurants/curated/home
// @access  Public
exports.getCuratedHome = async (req, res, next) => {
  try {
    const [popular, topRated, trending, offers] = await Promise.all([
      Restaurant.find({ isOpen: true }).sort({ reviewCount: -1 }).limit(6),
      Restaurant.find({ isOpen: true, rating: { $gte: 4.4 } }).sort({ rating: -1 }).limit(6),
      Restaurant.find({ featured: true }).limit(6),
      Restaurant.find({ 'offers.0': { $exists: true } }).limit(6)
    ]);

    res.status(200).json({
      success: true,
      data: {
        popular,
        topRated,
        trending,
        offers
      }
    });
  } catch (err) {
    next(err);
  }
};

