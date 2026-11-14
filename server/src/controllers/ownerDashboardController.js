const Order = require('../models/Order');
const Review = require('../models/Review');
const MenuItem = require('../models/MenuItem');

// @desc    Get comprehensive dashboard metrics and chart data
// @route   GET /api/v1/owner/dashboard/stats
// @access  Private (Owner + attachRestaurant)
const getDashboardStats = async (req, res) => {
  try {
    const restaurantId = req.restaurant._id;
    const { period = 'daily' } = req.query; // daily, weekly, monthly, yearly

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 1. Basic Stats aggregation
    const allOrders = await Order.find({ 'restaurant.id': restaurantId });
    const totalOrders = allOrders.length;

    const todayOrders = allOrders.filter(
      (o) => new Date(o.createdAt) >= startOfToday
    );

    const totalRevenue = allOrders
      .filter((o) => o.orderStatus !== 'cancelled')
      .reduce((sum, o) => sum + (o.pricing?.finalAmount || 0), 0);

    const todayRevenue = todayOrders
      .filter((o) => o.orderStatus !== 'cancelled')
      .reduce((sum, o) => sum + (o.pricing?.finalAmount || 0), 0);

    const pendingOrders = allOrders.filter(
      (o) => o.orderStatus === 'placed' || o.orderStatus === 'confirmed' || o.orderStatus === 'preparing'
    ).length;

    const completedOrders = allOrders.filter(
      (o) => o.orderStatus === 'delivered'
    ).length;

    // 2. Average Restaurant Rating & Review Count
    const reviews = await Review.find({ restaurant: restaurantId });
    const totalReviews = reviews.length;
    const avgRating =
      totalReviews > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
        : (req.restaurant.rating || 4.5).toFixed(1);

    // 3. Sales Chart Data based on period
    let chartData = [];
    if (period === 'daily') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
        const dayLabel = dayStart.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

        const dayOrders = allOrders.filter(
          (o) => new Date(o.createdAt) >= dayStart && new Date(o.createdAt) <= dayEnd && o.orderStatus !== 'cancelled'
        );
        const revenue = dayOrders.reduce((sum, o) => sum + (o.pricing?.finalAmount || 0), 0);

        chartData.push({
          label: dayLabel,
          orders: dayOrders.length,
          revenue: Math.round(revenue / 100) // in rupees for charts
        });
      }
    } else if (period === 'weekly') {
      // Last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
        const weekEnd = new Date(now);
        weekEnd.setDate(weekEnd.getDate() - i * 7);
        const weekLabel = `Week ${4 - i}`;

        const weekOrders = allOrders.filter(
          (o) => new Date(o.createdAt) >= weekStart && new Date(o.createdAt) < weekEnd && o.orderStatus !== 'cancelled'
        );
        const revenue = weekOrders.reduce((sum, o) => sum + (o.pricing?.finalAmount || 0), 0);

        chartData.push({
          label: weekLabel,
          orders: weekOrders.length,
          revenue: Math.round(revenue / 100)
        });
      }
    } else if (period === 'monthly') {
      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextM = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const monthLabel = m.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

        const monthOrders = allOrders.filter(
          (o) => new Date(o.createdAt) >= m && new Date(o.createdAt) < nextM && o.orderStatus !== 'cancelled'
        );
        const revenue = monthOrders.reduce((sum, o) => sum + (o.pricing?.finalAmount || 0), 0);

        chartData.push({
          label: monthLabel,
          orders: monthOrders.length,
          revenue: Math.round(revenue / 100)
        });
      }
    } else {
      // Yearly (by quarter or past 3 years)
      for (let i = 2; i >= 0; i--) {
        const y = now.getFullYear() - i;
        const yearStart = new Date(y, 0, 1);
        const yearEnd = new Date(y, 11, 31, 23, 59, 59);

        const yearOrders = allOrders.filter(
          (o) => new Date(o.createdAt) >= yearStart && new Date(o.createdAt) <= yearEnd && o.orderStatus !== 'cancelled'
        );
        const revenue = yearOrders.reduce((sum, o) => sum + (o.pricing?.finalAmount || 0), 0);

        chartData.push({
          label: `${y}`,
          orders: yearOrders.length,
          revenue: Math.round(revenue / 100)
        });
      }
    }

    // 4. Order Status Distribution (for Pie/Donut Chart)
    const statusCounts = {
      placed: 0,
      confirmed: 0,
      preparing: 0,
      ready_for_pickup: 0,
      delivered: 0,
      cancelled: 0
    };
    allOrders.forEach((o) => {
      if (statusCounts[o.orderStatus] !== undefined) {
        statusCounts[o.orderStatus]++;
      }
    });

    const statusDistribution = [
      { name: 'New Orders', value: statusCounts.placed, color: '#3B82F6' },
      { name: 'Confirmed', value: statusCounts.confirmed, color: '#8B5CF6' },
      { name: 'Preparing', value: statusCounts.preparing, color: '#F97316' },
      { name: 'Ready for Pickup', value: statusCounts.ready_for_pickup, color: '#06B6D4' },
      { name: 'Delivered', value: statusCounts.delivered, color: '#15803D' },
      { name: 'Cancelled', value: statusCounts.cancelled, color: '#DC2626' }
    ].filter((s) => s.value > 0);

    // 5. Bestselling items
    const itemSalesMap = {};
    allOrders.forEach((o) => {
      if (o.orderStatus !== 'cancelled' && Array.isArray(o.items)) {
        o.items.forEach((item) => {
          const key = item.name;
          if (!itemSalesMap[key]) {
            itemSalesMap[key] = {
              name: item.name,
              image: item.image,
              price: item.price,
              quantitySold: 0,
              totalRevenue: 0
            };
          }
          itemSalesMap[key].quantitySold += item.quantity || 1;
          itemSalesMap[key].totalRevenue += item.itemTotal || (item.price * (item.quantity || 1));
        });
      }
    });

    const bestsellers = Object.values(itemSalesMap)
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 5);

    // 6. Recent Orders (last 8)
    const recentOrders = await Order.find({ 'restaurant.id': restaurantId })
      .sort({ createdAt: -1 })
      .limit(8)
      .select('orderNumber items pricing payment orderStatus deliveryAddress createdAt');

    // 7. Recent Reviews (last 4)
    const recentReviews = await Review.find({ restaurant: restaurantId })
      .sort({ createdAt: -1 })
      .limit(4);

    return res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        todayOrders: todayOrders.length,
        totalRevenue,
        todayRevenue,
        pendingOrders,
        completedOrders,
        avgRating: Number(avgRating),
        totalReviews,
        isOpen: req.restaurant.isOpen,
        isTemporarilyClosed: req.restaurant.isTemporarilyClosed,
        approvalStatus: req.restaurant.approvalStatus
      },
      chartData,
      statusDistribution,
      bestsellers,
      recentOrders,
      recentReviews
    });
  } catch (err) {
    console.error('Get dashboard stats error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard analytics.'
    });
  }
};

module.exports = {
  getDashboardStats
};

