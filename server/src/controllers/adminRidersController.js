const User = require('../models/User');
const RiderProfile = require('../models/RiderProfile');
const Order = require('../models/Order');
const RiderEarning = require('../models/RiderEarning');
const { recordAudit } = require('../middleware/adminAuth');

// @desc    Get paginated riders list with status and profile info
// @route   GET /api/v1/admin/riders
// @access  Private (Admin - Operations/Super)
const getRiders = async (req, res) => {
  try {
    const {
      search = '',
      verificationStatus = 'all',
      isSuspended,
      isAvailable,
      city = '',
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = req.query;

    const profileQuery = {};

    if (verificationStatus !== 'all') {
      profileQuery.verificationStatus = verificationStatus;
    }

    if (isAvailable !== undefined && isAvailable !== '') {
      profileQuery.isAvailable = isAvailable === 'true';
    }

    if (city.trim()) {
      profileQuery.operatingCity = new RegExp(city.trim(), 'i');
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // If searching by rider name, phone, or email, find user IDs first
    if (search.trim()) {
      const reg = new RegExp(search.trim(), 'i');
      const matchingUsers = await User.find({
        role: 'rider',
        $or: [{ name: reg }, { email: reg }, { phone: reg }]
      }).select('_id');

      const userIds = matchingUsers.map((u) => u._id);
      profileQuery.user = { $in: userIds };
    }

    if (isSuspended !== undefined && isSuspended !== '') {
      const suspendedStatus = isSuspended === 'true';
      const usersBySuspension = await User.find({
        role: 'rider',
        isSuspended: suspendedStatus
      }).select('_id');

      const userIds = usersBySuspension.map((u) => u._id);
      if (profileQuery.user) {
        // intersect
        const existing = profileQuery.user.$in.map(String);
        profileQuery.user = { $in: userIds.filter((id) => existing.includes(String(id))) };
      } else {
        profileQuery.user = { $in: userIds };
      }
    }

    const [total, profiles] = await Promise.all([
      RiderProfile.countDocuments(profileQuery),
      RiderProfile.find(profileQuery)
        .populate('user', 'name email phone avatar isSuspended suspensionReason createdAt')
        .sort(sort)
        .skip(skip)
        .limit(take)
        .lean()
    ]);

    // Format output
    const enriched = profiles.map((p) => {
      const u = p.user || {};
      return {
        _id: p._id,
        userId: u._id,
        name: u.name || 'Rider',
        email: u.email || '',
        phone: u.phone || '',
        avatar: u.avatar || '',
        isSuspended: u.isSuspended || false,
        suspensionReason: u.suspensionReason || '',
        verificationStatus: p.verificationStatus,
        isAvailable: p.isAvailable,
        operatingCity: p.operatingCity,
        vehicleDetails: p.vehicleDetails,
        bankDetails: p.bankDetails,
        rating: p.rating,
        totalDeliveries: p.totalDeliveries,
        walletBalance: p.walletBalance,
        documents: p.documents,
        createdAt: p.createdAt
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        riders: enriched,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / take) || 1,
          limit: take
        }
      }
    });
  } catch (err) {
    console.error('Error fetching riders:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve riders.'
    });
  }
};

// @desc    Get detailed rider information
// @route   GET /api/v1/admin/riders/:id
// @access  Private (Admin)
const getRiderDetails = async (req, res) => {
  try {
    const profile = await RiderProfile.findById(req.params.id)
      .populate('user', 'name email phone avatar isSuspended suspensionReason createdAt')
      .lean();

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Rider profile not found.'
      });
    }

    const riderUserId = profile.user?._id;

    const [recentDeliveries, earningsHistory] = await Promise.all([
      Order.find({ rider: riderUserId })
        .populate('restaurant', 'name logo')
        .populate('user', 'name phone')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      RiderEarning.find({ rider: riderUserId })
        .sort({ date: -1 })
        .limit(14)
        .lean()
    ]);

    return res.status(200).json({
      success: true,
      data: {
        profile,
        user: profile.user,
        recentDeliveries,
        earningsHistory
      }
    });
  } catch (err) {
    console.error('Error fetching rider details:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve rider details.'
    });
  }
};

// @desc    Update rider verification status (approve / reject / pending)
// @route   PATCH /api/v1/admin/riders/:id/verification
// @access  Private (Admin - Operations/Super)
const updateRiderVerification = async (req, res) => {
  try {
    const { status, reason = '' } = req.body; // 'approved' | 'rejected' | 'pending'

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification status. Must be approved, rejected, or pending.'
      });
    }

    const profile = await RiderProfile.findById(req.params.id).populate('user', 'name email');
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Rider profile not found.'
      });
    }

    const prevStatus = profile.verificationStatus;
    profile.verificationStatus = status;
    await profile.save();

    await recordAudit({
      admin: req.user,
      action: `rider_verification_${status}`,
      targetType: 'Rider',
      targetId: profile._id,
      targetName: profile.user?.name || 'Rider',
      reason: reason || `Rider verification changed to ${status}`,
      details: {
        previousStatus: prevStatus,
        newStatus: status,
        riderUser: profile.user?._id
      },
      req
    });

    return res.status(200).json({
      success: true,
      message: `Rider verification status set to ${status}.`,
      data: {
        id: profile._id,
        verificationStatus: profile.verificationStatus
      }
    });
  } catch (err) {
    console.error('Error updating rider verification:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update rider verification status.'
    });
  }
};

// @desc    Toggle rider suspension
// @route   PATCH /api/v1/admin/riders/:id/suspend
// @access  Private (Admin - Operations/Super)
const toggleRiderSuspension = async (req, res) => {
  try {
    const { isSuspended, reason = '' } = req.body;
    const profile = await RiderProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Rider profile not found.'
      });
    }

    const riderUser = await User.findById(profile.user);
    if (!riderUser) {
      return res.status(404).json({
        success: false,
        message: 'Rider user account not found.'
      });
    }

    const prev = riderUser.isSuspended || false;
    riderUser.isSuspended = isSuspended !== undefined ? Boolean(isSuspended) : !prev;
    riderUser.suspensionReason = riderUser.isSuspended ? reason || 'Administrative rider suspension' : '';
    await riderUser.save();

    // If suspended, set rider offline
    if (riderUser.isSuspended) {
      profile.isAvailable = false;
      await profile.save();
    }

    await recordAudit({
      admin: req.user,
      action: riderUser.isSuspended ? 'suspend_rider' : 'reactivate_rider',
      targetType: 'Rider',
      targetId: profile._id,
      targetName: riderUser.name,
      reason: reason || (riderUser.isSuspended ? 'Rider suspended' : 'Rider reactivated'),
      details: {
        previousStatus: prev,
        newStatus: riderUser.isSuspended,
        reason: riderUser.suspensionReason
      },
      req
    });

    return res.status(200).json({
      success: true,
      message: riderUser.isSuspended ? 'Rider has been suspended.' : 'Rider has been reactivated.',
      data: {
        id: profile._id,
        isSuspended: riderUser.isSuspended,
        suspensionReason: riderUser.suspensionReason
      }
    });
  } catch (err) {
    console.error('Error toggling rider suspension:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update rider suspension status.'
    });
  }
};

module.exports = {
  getRiders,
  getRiderDetails,
  updateRiderVerification,
  toggleRiderSuspension
};
