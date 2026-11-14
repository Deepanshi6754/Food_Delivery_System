const DeliveryAssignment = require('../models/DeliveryAssignment');
const Order = require('../models/Order');

// @desc    Get rider's historical deliveries
// @route   GET /api/v1/rider/history
// @access  Private (Rider + attachRiderProfile)
const getDeliveryHistory = async (req, res) => {
  try {
    const riderId = req.user._id;
    const { status, search, page = 1, limit = 15 } = req.query;

    const query = { rider: riderId };

    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await DeliveryAssignment.countDocuments(query);

    const assignments = await DeliveryAssignment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('order');

    let filtered = assignments;
    if (search) {
      filtered = assignments.filter((a) => {
        const orderNum = a.order?.orderNumber || '';
        const custName = a.order?.deliveryAddress?.recipientName || '';
        const restName = a.order?.restaurant?.name || '';
        const s = search.toLowerCase();
        return (
          orderNum.toLowerCase().includes(s) ||
          custName.toLowerCase().includes(s) ||
          restName.toLowerCase().includes(s)
        );
      });
    }

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      totalPages: Math.ceil(total / Number(limit)),
      data: filtered,
      deliveries: filtered
    });
  } catch (err) {
    console.error('Get delivery history error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve delivery history.'
    });
  }
};

// @desc    Get single delivery assignment details
// @route   GET /api/v1/rider/history/:id
// @access  Private (Rider + attachRiderProfile)
const getDeliveryDetails = async (req, res) => {
  try {
    const assignment = await DeliveryAssignment.findOne({
      _id: req.params.id,
      rider: req.user._id
    }).populate('order');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Delivery record not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: assignment,
      delivery: assignment
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve delivery details.'
    });
  }
};

module.exports = {
  getDeliveryHistory,
  getDeliveryDetails
};

