const RiderEarning = require('../models/RiderEarning');
const RiderPayout = require('../models/RiderPayout');

// @desc    Get rider earnings summary, breakdowns, and payout status
// @route   GET /api/v1/rider/earnings/summary
// @access  Private (Rider + attachRiderProfile)
const getEarningsSummary = async (req, res) => {
  try {
    const riderId = req.user._id;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const allEarnings = await RiderEarning.find({ rider: riderId }).sort({ createdAt: -1 }).populate('order', 'orderNumber restaurant');

    const totalPaise = allEarnings.reduce((s, e) => s + (e.totalAmount || 0), 0);
    const todayPaise = allEarnings
      .filter((e) => new Date(e.createdAt) >= startOfToday)
      .reduce((s, e) => s + (e.totalAmount || 0), 0);
    const weekPaise = allEarnings
      .filter((e) => new Date(e.createdAt) >= startOfWeek)
      .reduce((s, e) => s + (e.totalAmount || 0), 0);
    const monthPaise = allEarnings
      .filter((e) => new Date(e.createdAt) >= startOfMonth)
      .reduce((s, e) => s + (e.totalAmount || 0), 0);

    const payouts = await RiderPayout.find({ rider: riderId }).sort({ createdAt: -1 });

    const totalPaidOutPaise = payouts
      .filter((p) => p.status === 'completed')
      .reduce((s, p) => s + (p.amount || 0), 0);

    const pendingPayoutPaise = payouts
      .filter((p) => p.status === 'pending' || p.status === 'processing')
      .reduce((s, p) => s + (p.amount || 0), 0);

    // Weekly day-by-day trend
    const weeklyBreakdown = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
      const dayLabel = dayStart.toLocaleDateString('en-US', { weekday: 'short' });

      const dayEarn = allEarnings.filter(
        (e) => new Date(e.createdAt) >= dayStart && new Date(e.createdAt) <= dayEnd
      );
      const dayTotal = dayEarn.reduce((s, e) => s + (e.totalAmount || 0), 0);

      weeklyBreakdown.push({
        day: dayLabel,
        amount: Math.round(dayTotal / 100),
        count: dayEarn.length
      });
    }

    const availableBalance = Math.max(0, totalPaise - totalPaidOutPaise - pendingPayoutPaise);

    return res.status(200).json({
      success: true,
      data: {
        totalEarnings: totalPaise,
        todayEarnings: todayPaise,
        weeklyEarnings: weekPaise,
        monthlyEarnings: monthPaise,
        totalPaidOut: totalPaidOutPaise,
        pendingPayout: pendingPayoutPaise,
        availableBalance,
        dailyBreakdown: weeklyBreakdown,
        payouts,
        recentEarnings: allEarnings.slice(0, 15)
      },
      summary: {
        totalEarningsPaise: totalPaise,
        todayEarningsPaise: todayPaise,
        weeklyEarningsPaise: weekPaise,
        monthlyEarningsPaise: monthPaise,
        totalPaidOutPaise,
        pendingPayoutPaise,
        availableBalancePaise: availableBalance
      },
      weeklyBreakdown,
      recentEarnings: allEarnings.slice(0, 15),
      payouts
    });
  } catch (err) {
    console.error('Get earnings summary error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve earnings summary.'
    });
  }
};

// @desc    Request withdrawal of available balance
// @route   POST /api/v1/rider/earnings/withdraw
// @access  Private (Rider + attachRiderProfile)
const requestWithdrawal = async (req, res) => {
  try {
    const riderId = req.user._id;
    const profile = req.riderProfile;
    const { amountPaise, amount, payoutMethod = 'bank_transfer' } = req.body;
    const withdrawAmount = Number(amountPaise || amount);

    if (!withdrawAmount || withdrawAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid withdrawal amount.'
      });
    }

    const allEarnings = await RiderEarning.find({ rider: riderId });
    const totalEarned = allEarnings.reduce((s, e) => s + (e.totalAmount || 0), 0);

    const existingPayouts = await RiderPayout.find({ rider: riderId });
    const committedPayouts = existingPayouts
      .filter((p) => p.status === 'completed' || p.status === 'processing' || p.status === 'pending')
      .reduce((s, p) => s + (p.amount || 0), 0);

    const availableBalance = totalEarned - committedPayouts;

    if (withdrawAmount > availableBalance) {
      return res.status(400).json({
        success: false,
        message: `Requested amount exceeds available balance of ₹${(availableBalance / 100).toFixed(0)}.`
      });
    }

    const newPayout = await RiderPayout.create({
      rider: riderId,
      amount: withdrawAmount,
      payoutMethod,
      bankDetails: profile.bankDetails || {},
      status: 'processing',
      processedAt: new Date()
    });

    return res.status(201).json({
      success: true,
      message: `Payout request of ₹${(withdrawAmount / 100).toFixed(0)} submitted for bank transfer processing.`,
      payout: newPayout
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to process payout request.'
    });
  }
};

module.exports = {
  getEarningsSummary,
  requestWithdrawal
};

