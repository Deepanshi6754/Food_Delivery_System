const PlatformSettings = require('../models/PlatformSettings');
const { recordAudit } = require('../middleware/adminAuth');

// @desc    Get Platform Settings
// @route   GET /api/v1/admin/settings
// @access  Private (Admin)
const getSettings = async (req, res) => {
  try {
    const settings = await PlatformSettings.getSettings();
    return res.status(200).json({
      success: true,
      data: settings
    });
  } catch (err) {
    console.error('Error fetching platform settings:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve platform settings.'
    });
  }
};

// @desc    Update Platform Settings
// @route   PUT /api/v1/admin/settings
// @access  Private (Admin - Super Admin only)
const updateSettings = async (req, res) => {
  try {
    let settings = await PlatformSettings.getSettings();

    const allowedFields = [
      'platformName',
      'platformTagline',
      'supportEmail',
      'supportPhone',
      'currency',
      'currencySymbol',
      'defaultCommissionRate',
      'deliveryFeeBase',
      'deliveryFeePerKm',
      'taxRate',
      'minOrderAmount',
      'freeDeliveryThreshold',
      'maintenanceMode',
      'maintenanceMessage',
      'orderCancellationWindowMinutes',
      'autoApproveRestaurants',
      'autoApproveRiders',
      'serviceableCities'
    ];

    const updatedFields = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
        updatedFields[field] = req.body[field];
      }
    });

    settings.updatedBy = req.user._id;
    await settings.save();

    await recordAudit({
      admin: req.user,
      action: 'update_platform_settings',
      targetType: 'Settings',
      targetId: settings._id,
      targetName: 'Global Platform Settings',
      reason: 'Admin updated configuration parameters',
      details: updatedFields,
      req
    });

    return res.status(200).json({
      success: true,
      message: 'Platform settings updated successfully.',
      data: settings
    });
  } catch (err) {
    console.error('Error updating platform settings:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update platform settings.'
    });
  }
};

module.exports = {
  getSettings,
  updateSettings
};
