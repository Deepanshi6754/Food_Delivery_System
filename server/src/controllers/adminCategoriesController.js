const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');
const { recordAudit } = require('../middleware/adminAuth');

// @desc    Get all categories with item counts
// @route   GET /api/v1/admin/categories
// @access  Private (Admin)
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ displayOrder: 1, name: 1 }).lean();

    // Dish counts per category
    const counts = await MenuItem.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const countMap = {};
    counts.forEach((c) => {
      countMap[c._id] = c.count;
    });

    const enriched = categories.map((cat) => ({
      ...cat,
      itemCount: countMap[cat.name] || countMap[cat.slug] || 0
    }));

    return res.status(200).json({
      success: true,
      data: enriched
    });
  } catch (err) {
    console.error('Error fetching categories:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve categories.'
    });
  }
};

// @desc    Create global food category
// @route   POST /api/v1/admin/categories
// @access  Private (Admin - Operations/Super)
const createCategory = async (req, res) => {
  try {
    const { name, description, image, iconName, displayOrder, isActive = true } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required.'
      });
    }

    const slug = req.body.slug || name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const existing = await Category.findOne({ $or: [{ name: name.trim() }, { slug }] });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A category with this name or slug already exists.'
      });
    }

    const category = await Category.create({
      name: name.trim(),
      slug,
      description: description || '',
      image: image || '',
      iconName: iconName || 'Utensils',
      displayOrder: displayOrder || 0,
      isActive: Boolean(isActive)
    });

    await recordAudit({
      admin: req.user,
      action: 'create_category',
      targetType: 'Category',
      targetId: category._id,
      targetName: category.name,
      reason: 'Created new global food category',
      details: { slug: category.slug },
      req
    });

    return res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      data: category
    });
  } catch (err) {
    console.error('Error creating category:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to create category.'
    });
  }
};

// @desc    Update category
// @route   PUT /api/v1/admin/categories/:id
// @access  Private (Admin - Operations/Super)
const updateCategory = async (req, res) => {
  try {
    const { name, slug, description, image, iconName, displayOrder, isActive } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.'
      });
    }

    if (name) category.name = name.trim();
    if (slug) category.slug = slug.trim().toLowerCase();
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (iconName !== undefined) category.iconName = iconName;
    if (displayOrder !== undefined) category.displayOrder = displayOrder;
    if (isActive !== undefined) category.isActive = Boolean(isActive);

    await category.save();

    await recordAudit({
      admin: req.user,
      action: 'update_category',
      targetType: 'Category',
      targetId: category._id,
      targetName: category.name,
      reason: 'Category details updated',
      details: req.body,
      req
    });

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully.',
      data: category
    });
  } catch (err) {
    console.error('Error updating category:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update category.'
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/v1/admin/categories/:id
// @access  Private (Admin - Operations/Super)
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.'
      });
    }

    const catName = category.name;
    await Category.findByIdAndDelete(req.params.id);

    await recordAudit({
      admin: req.user,
      action: 'delete_category',
      targetType: 'Category',
      targetId: req.params.id,
      targetName: catName,
      reason: 'Category deleted by admin',
      req
    });

    return res.status(200).json({
      success: true,
      message: 'Category deleted successfully.'
    });
  } catch (err) {
    console.error('Error deleting category:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete category.'
    });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
