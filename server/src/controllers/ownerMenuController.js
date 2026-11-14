const MenuItem = require('../models/MenuItem');

// @desc    Get all menu items for owner's restaurant
// @route   GET /api/v1/owner/menu
// @access  Private (Owner + attachRestaurant)
const getMenuItems = async (req, res) => {
  try {
    const restaurantId = req.restaurant._id;
    const { category, search, dietary, sort } = req.query;

    const query = { restaurant: restaurantId };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (dietary === 'veg') query.isVeg = true;
    if (dietary === 'vegan') query.isVegan = true;
    if (dietary === 'jain') query.isJain = true;
    if (dietary === 'non-veg') query.isVeg = false;

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };
    if (sort === 'name') sortOption = { name: 1 };

    const items = await MenuItem.find(query).sort(sortOption);

    // Extract unique categories
    const allCategories = await MenuItem.distinct('category', { restaurant: restaurantId });

    return res.status(200).json({
      success: true,
      count: items.length,
      categories: allCategories,
      items
    });
  } catch (err) {
    console.error('Get menu items error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve menu items.'
    });
  }
};

// @desc    Get a single menu item
// @route   GET /api/v1/owner/menu/:id
// @access  Private (Owner + attachRestaurant)
const getMenuItemById = async (req, res) => {
  try {
    const item = await MenuItem.findOne({
      _id: req.params.id,
      restaurant: req.restaurant._id
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found or does not belong to your restaurant.'
      });
    }

    return res.status(200).json({
      success: true,
      item
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve menu item.'
    });
  }
};

// @desc    Create a new menu item
// @route   POST /api/v1/owner/menu
// @access  Private (Owner + attachRestaurant)
const createMenuItem = async (req, res) => {
  try {
    const {
      name,
      description,
      price, // in paise
      category,
      image,
      isVeg,
      isVegan,
      isJain,
      isBestseller,
      preparationTime,
      isAvailable,
      sizes,
      addOns
    } = req.body;

    if (!name || price === undefined || !category || !image) {
      return res.status(400).json({
        success: false,
        message: 'Please provide dish name, price, category, and image URL.'
      });
    }

    if (Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price cannot be negative.'
      });
    }

    const newItem = await MenuItem.create({
      restaurant: req.restaurant._id,
      name,
      description: description || '',
      price: Number(price),
      category,
      image,
      isVeg: isVeg !== undefined ? Boolean(isVeg) : true,
      isVegan: Boolean(isVegan),
      isJain: Boolean(isJain),
      isBestseller: Boolean(isBestseller),
      preparationTime: preparationTime ? Number(preparationTime) : 20,
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
      sizes: Array.isArray(sizes) ? sizes : [],
      addOns: Array.isArray(addOns) ? addOns : []
    });

    return res.status(201).json({
      success: true,
      message: 'Food item added to menu successfully.',
      item: newItem
    });
  } catch (err) {
    console.error('Create menu item error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to add food item to menu.'
    });
  }
};

// @desc    Update a menu item
// @route   PUT /api/v1/owner/menu/:id
// @access  Private (Owner + attachRestaurant)
const updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findOne({
      _id: req.params.id,
      restaurant: req.restaurant._id
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found or does not belong to your restaurant.'
      });
    }

    const {
      name,
      description,
      price,
      category,
      image,
      isVeg,
      isVegan,
      isJain,
      isBestseller,
      preparationTime,
      isAvailable,
      sizes,
      addOns
    } = req.body;

    if (name) item.name = name;
    if (description !== undefined) item.description = description;
    if (price !== undefined) item.price = Number(price);
    if (category) item.category = category;
    if (image) item.image = image;
    if (isVeg !== undefined) item.isVeg = Boolean(isVeg);
    if (isVegan !== undefined) item.isVegan = Boolean(isVegan);
    if (isJain !== undefined) item.isJain = Boolean(isJain);
    if (isBestseller !== undefined) item.isBestseller = Boolean(isBestseller);
    if (preparationTime !== undefined) item.preparationTime = Number(preparationTime);
    if (isAvailable !== undefined) item.isAvailable = Boolean(isAvailable);
    if (Array.isArray(sizes)) item.sizes = sizes;
    if (Array.isArray(addOns)) item.addOns = addOns;

    await item.save();

    return res.status(200).json({
      success: true,
      message: 'Menu item updated successfully.',
      item
    });
  } catch (err) {
    console.error('Update menu item error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update menu item.'
    });
  }
};

// @desc    Delete a menu item
// @route   DELETE /api/v1/owner/menu/:id
// @access  Private (Owner + attachRestaurant)
const deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findOneAndDelete({
      _id: req.params.id,
      restaurant: req.restaurant._id
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found or does not belong to your restaurant.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Menu item removed from menu.'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete menu item.'
    });
  }
};

// @desc    Toggle menu item availability
// @route   PATCH /api/v1/owner/menu/:id/availability
// @access  Private (Owner + attachRestaurant)
const toggleItemAvailability = async (req, res) => {
  try {
    const item = await MenuItem.findOne({
      _id: req.params.id,
      restaurant: req.restaurant._id
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found.'
      });
    }

    item.isAvailable = !item.isAvailable;
    await item.save();

    return res.status(200).json({
      success: true,
      message: `${item.name} is now ${item.isAvailable ? 'available' : 'marked out of stock'}.`,
      isAvailable: item.isAvailable
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle availability.'
    });
  }
};

module.exports = {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleItemAvailability
};

