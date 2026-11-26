const User = require('../models/User');
const Address = require('../models/Address');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const Coupon = require('../models/Coupon');
const Review = require('../models/Review');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const Payout = require('../models/Payout');
const RiderProfile = require('../models/RiderProfile');
const PlatformSettings = require('../models/PlatformSettings');
const Category = require('../models/Category');
const SupportTicket = require('../models/SupportTicket');
const Refund = require('../models/Refund');
const AuditLog = require('../models/AuditLog');
const { restaurants, coupons, getRestaurantMenuItems } = require('./seedData');

const seedDatabase = async () => {
  try {
    // 1. Create Demo Customer & Admin
    let customer = await User.findOne({ email: 'demo@fooddelight.com' });
    if (!customer) {
      customer = await User.create({
        name: 'Rahul Verma',
        email: 'demo@fooddelight.com',
        phone: '+91 98765 12345',
        password: 'password123',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        role: 'customer'
      });
      console.log('Demo customer created: demo@fooddelight.com / password123');
    }

    // 1b. Seed Admin Accounts (Role-Based Access)
    let admin = await User.findOne({ email: 'admin@fooddelight.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Aarav Singhania (Super Admin)',
        email: 'admin@fooddelight.com',
        phone: '+91 98765 99999',
        password: 'admin123',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        role: 'admin',
        adminRole: 'super_admin'
      });
      console.log('Super Admin created: admin@fooddelight.com / admin123');
    } else {
      admin.role = 'admin';
      admin.adminRole = 'super_admin';
      await admin.save();
    }

    let opsAdmin = await User.findOne({ email: 'ops@fooddelight.com' });
    if (!opsAdmin) {
      opsAdmin = await User.create({
        name: 'Priya Mehra (Operations)',
        email: 'ops@fooddelight.com',
        phone: '+91 98765 99998',
        password: 'admin123',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        role: 'admin',
        adminRole: 'operations_admin'
      });
      console.log('Operations Admin created: ops@fooddelight.com / admin123');
    }

    let financeAdmin = await User.findOne({ email: 'finance@fooddelight.com' });
    if (!financeAdmin) {
      financeAdmin = await User.create({
        name: 'Vikram Joshi (Finance)',
        email: 'finance@fooddelight.com',
        phone: '+91 98765 99997',
        password: 'admin123',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        role: 'admin',
        adminRole: 'finance_admin'
      });
      console.log('Finance Admin created: finance@fooddelight.com / admin123');
    }

    let supportAdmin = await User.findOne({ email: 'support@fooddelight.com' });
    if (!supportAdmin) {
      supportAdmin = await User.create({
        name: 'Kavita Sen (Support)',
        email: 'support@fooddelight.com',
        phone: '+91 98765 99996',
        password: 'admin123',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        role: 'admin',
        adminRole: 'support_admin'
      });
      console.log('Support Admin created: support@fooddelight.com / admin123');
    }

    // 2. Create Demo Restaurant Owner
    let owner = await User.findOne({ email: 'owner@fooddelight.com' });
    if (!owner) {
      owner = await User.create({
        name: 'Chef Marco Rossi',
        email: 'owner@fooddelight.com',
        phone: '+91 98765 88888',
        password: 'owner123',
        avatar: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=150',
        role: 'restaurant_owner',
        isApproved: true,
        approvalStatus: 'approved'
      });
      console.log('Demo restaurant owner created: owner@fooddelight.com / owner123');
    }

    // === Demo Rider ===
    let rider = await User.findOne({ email: 'rider@fooddelight.com' });
    if (!rider) {
      rider = await User.create({
        name: 'Rahul Sharma',
        email: 'rider@fooddelight.com',
        phone: '+919876577777',
        password: 'rider123',
        role: 'delivery_partner',
        isApproved: true,
        isVerified: true,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        approvalStatus: 'approved'
      });
      console.log('Demo rider user created:', rider.email);
    }

    // Create RiderProfile for demo rider
    const existingRiderProfile = await RiderProfile.findOne({ user: rider._id });
    if (!existingRiderProfile) {
      await RiderProfile.create({
        user: rider._id,
        vehicleType: 'Motorcycle',
        vehicleNumber: 'DL-01-FD-5678',
        licenseNumber: 'DL-123456789',
        preferredArea: 'Central Delhi',
        verificationStatus: 'approved',
        isOnline: true,
        isAvailable: true,
        rating: 4.8,
        totalRatings: 84,
        totalDeliveries: 128,
        completionRate: 96.5,
        bankDetails: {
          accountHolderName: 'Rahul Sharma',
          accountNumber: '9876543210',
          ifscCode: 'HDFC0001234',
          bankName: 'HDFC Bank'
        }
      });
      console.log('Demo rider profile created');
    }

    // Create sample RiderEarnings for demo rider
    const RiderEarning = require('../models/RiderEarning');
    const existingEarnings = await RiderEarning.countDocuments({ rider: rider._id });
    if (existingEarnings === 0) {
      const earningDates = [0, 1, 2, 3, 4].map(d => {
        const dt = new Date();
        dt.setDate(dt.getDate() - d);
        return dt;
      });
      for (let i = 0; i < 5; i++) {
        await RiderEarning.create({
          rider: rider._id,
          deliveryFee: Math.floor(Math.random() * 3000) + 2000, // paise
          tip: Math.floor(Math.random() * 1000),
          bonus: i === 0 ? 500 : 0,
          platformFee: 200,
          status: 'credited',
          date: earningDates[i],
          notes: `Delivery earning for day ${i}`
        });
      }
      console.log('Demo rider earnings seeded');
    }

    const restaurantCount = await Restaurant.countDocuments();
    let sampleRestaurant;

    if (restaurantCount === 0) {
      console.log('Seeding fresh FoodDelight initial data...');

      // Create Default Address for customer
      await Address.create({
        user: customer._id,
        label: 'Home',
        recipientName: 'Rahul Verma',
        phone: '+91 98765 12345',
        houseNo: 'Flat 402, Lotus Towers',
        street: 'Barakhamba Road',
        area: 'Connaught Place',
        landmark: 'Near Metro Station Gate 3',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
        isDefault: true,
        deliveryInstructions: 'Ring bell and leave at door step'
      });

      // Seed Coupons
      await Coupon.deleteMany({});
      await Coupon.insertMany(coupons);

      // Seed Restaurants & MenuItems
      await Restaurant.deleteMany({});
      await MenuItem.deleteMany({});

      for (let i = 0; i < restaurants.length; i++) {
        const rData = { ...restaurants[i] };
        if (i === 0) {
          rData.owner = owner._id;
          rData.contactEmail = 'lapinoz@fooddelight.com';
          rData.contactPhone = '+91 98765 88888';
          rData.approvalStatus = 'approved';
        }
        const createdRestaurant = await Restaurant.create(rData);
        if (i === 0) {
          sampleRestaurant = createdRestaurant;
          owner.restaurant = createdRestaurant._id;
          await owner.save();
        }
        const items = getRestaurantMenuItems(createdRestaurant._id, createdRestaurant.slug);
        if (items && items.length > 0) {
          await MenuItem.insertMany(items);
        }
      }
      console.log(`Seeded ${restaurants.length} restaurants and menu items.`);
    } else {
      sampleRestaurant = await Restaurant.findOne({ slug: 'la-pinoz-gourmet-pizza' });
      if (!sampleRestaurant) {
        sampleRestaurant = await Restaurant.findOne();
      }
      if (sampleRestaurant && (!sampleRestaurant.owner || sampleRestaurant.owner.toString() !== owner._id.toString())) {
        sampleRestaurant.owner = owner._id;
        sampleRestaurant.contactEmail = 'lapinoz@fooddelight.com';
        sampleRestaurant.contactPhone = '+91 98765 88888';
        sampleRestaurant.approvalStatus = 'approved';
        sampleRestaurant.preparationTime = 25;
        await sampleRestaurant.save();
      }
      if (sampleRestaurant && (!owner.restaurant || owner.restaurant.toString() !== sampleRestaurant._id.toString())) {
        owner.restaurant = sampleRestaurant._id;
        await owner.save();
      }
    }

    // Ensure sample orders for the owner's restaurant across different statuses
    const existingOrdersCount = sampleRestaurant
      ? await Order.countDocuments({ 'restaurant.id': sampleRestaurant._id })
      : 0;
    if (existingOrdersCount < 4 && sampleRestaurant) {
      const items = await MenuItem.find({ restaurant: sampleRestaurant._id }).limit(3);
      if (items.length > 0) {
        const statuses = ['placed', 'confirmed', 'preparing', 'ready_for_pickup', 'delivered'];
        for (let i = 0; i < statuses.length; i++) {
          const item = items[i % items.length];
          const st = statuses[i];
          const isDelivered = st === 'delivered';
          await Order.create({
            orderNumber: `FD-DEMO-${2000 + i}`,
            user: customer._id,
            restaurant: {
              id: sampleRestaurant._id,
              name: sampleRestaurant.name,
              image: sampleRestaurant.image,
              phone: '+91 11 2345 6789',
              address: sampleRestaurant.address
            },
            items: [
              {
                menuItemId: item._id,
                name: item.name,
                image: item.image,
                price: item.price,
                quantity: i + 1,
                size: { name: 'Medium (10 inch)', priceDelta: 8000 },
                itemTotal: (item.price + 8000) * (i + 1)
              }
            ],
            deliveryAddress: {
              label: 'Home',
              recipientName: 'Rahul Verma',
              phone: '+91 98765 12345',
              houseNo: 'Flat 402',
              street: 'Barakhamba Road',
              area: 'Connaught Place',
              city: 'New Delhi',
              pincode: '110001'
            },
            pricing: {
              subtotal: (item.price + 8000) * (i + 1),
              deliveryFee: 3900,
              taxes: Math.round(((item.price + 8000) * (i + 1)) * 0.05),
              discount: 0,
              finalAmount: ((item.price + 8000) * (i + 1)) + 3900 + Math.round(((item.price + 8000) * (i + 1)) * 0.05)
            },
            payment: {
              method: i % 2 === 0 ? 'razorpay' : 'cod',
              status: isDelivered ? 'completed' : 'pending',
              transactionId: `TXN-DEMO-${2000 + i}`
            },
            orderStatus: st,
            statusHistory: [
              { status: 'placed', timestamp: new Date(Date.now() - (6 - i) * 600000), note: 'Customer placed order' },
              ...(st !== 'placed' ? [{ status: 'confirmed', timestamp: new Date(Date.now() - (5 - i) * 600000), note: 'Accepted by kitchen' }] : []),
              ...(st === 'preparing' || st === 'ready_for_pickup' || st === 'delivered' ? [{ status: 'preparing', timestamp: new Date(Date.now() - (4 - i) * 600000), note: 'Preparing fresh meal' }] : []),
              ...(st === 'ready_for_pickup' || st === 'delivered' ? [{ status: 'ready_for_pickup', timestamp: new Date(Date.now() - (3 - i) * 600000), note: 'Order ready for rider pickup' }] : []),
              ...(st === 'delivered' ? [{ status: 'delivered', timestamp: new Date(Date.now() - 300000), note: 'Order delivered safely' }] : [])
            ]
          });
        }
        console.log('Seeded sample active and completed orders for demo owner.');
      }
    }

    // Ensure sample payout history exists for owner's restaurant
    const payoutCount = sampleRestaurant
      ? await Payout.countDocuments({ restaurant: sampleRestaurant._id })
      : 0;
    if (payoutCount === 0 && sampleRestaurant) {
      await Payout.create([
        {
          restaurant: sampleRestaurant._id,
          period: {
            startDate: new Date(Date.now() - 14 * 86400000),
            endDate: new Date(Date.now() - 7 * 86400000)
          },
          totalOrders: 42,
          grossRevenue: 2845000, // ₹28,450.00
          commission: 426750,    // 15% = ₹4,267.50
          discountFunded: 50000,
          refunds: 0,
          netPayable: 2368250,   // ₹23,682.50
          status: 'completed',
          processedAt: new Date(Date.now() - 6 * 86400000),
          transactionReference: 'NEFT-FD-78945612'
        },
        {
          restaurant: sampleRestaurant._id,
          period: {
            startDate: new Date(Date.now() - 7 * 86400000),
            endDate: new Date()
          },
          totalOrders: 58,
          grossRevenue: 3950000, // ₹39,500.00
          commission: 592500,    // 15% = ₹5,925.00
          discountFunded: 80000,
          refunds: 0,
          netPayable: 3277500,   // ₹32,775.00
          status: 'processing',
          processedAt: new Date(),
          transactionReference: 'NEFT-FD-89056723'
        }
      ]);
      console.log('Seeded sample payout records for demo owner.');
    }

    // 5. Seed a Sample Completed Order & Review for Demo Customer so they have historical data!
    if (!sampleRestaurant) {
      sampleRestaurant = await Restaurant.findOne({ slug: 'la-pinoz-gourmet-pizza' }) || await Restaurant.findOne();
    }
    const sampleItem = sampleRestaurant
      ? await MenuItem.findOne({ restaurant: sampleRestaurant._id })
      : null;
    const customerAddress = (await Address.findOne({ user: customer._id })) || {
      label: 'Home',
      recipientName: customer.name,
      phone: customer.phone,
      houseNo: 'Flat 402',
      street: 'Barakhamba Road',
      area: 'Connaught Place',
      city: 'New Delhi',
      pincode: '110001'
    };

    const existingSampleOrder = await Order.findOne({ orderNumber: 'FD-SAMPLE-1001' });
    if (sampleRestaurant && sampleItem && !existingSampleOrder) {
      const sampleOrder = await Order.create({
        orderNumber: 'FD-SAMPLE-1001',
        user: customer._id,
        restaurant: {
          id: sampleRestaurant._id,
          name: sampleRestaurant.name,
          image: sampleRestaurant.image,
          phone: '+91 11 2345 6789',
          address: sampleRestaurant.address
        },
        items: [
          {
            menuItemId: sampleItem._id,
            name: sampleItem.name,
            image: sampleItem.image,
            price: sampleItem.price,
            quantity: 1,
            size: { name: 'Regular (7 inch)', priceDelta: 0 },
            addOns: [{ name: 'Extra Fresh Mozzarella', price: 5900 }],
            itemTotal: sampleItem.price + 5900
          }
        ],
        deliveryAddress: {
          label: customerAddress.label,
          recipientName: customerAddress.recipientName,
          phone: customerAddress.phone,
          houseNo: customerAddress.houseNo,
          street: customerAddress.street,
          area: customerAddress.area,
          city: customerAddress.city,
          pincode: customerAddress.pincode
        },
        pricing: {
          subtotal: sampleItem.price + 5900,
          deliveryFee: 0,
          taxes: Math.round((sampleItem.price + 5900) * 0.05),
          discount: 5000,
          finalAmount: sampleItem.price + 5900 + Math.round((sampleItem.price + 5900) * 0.05) - 5000
        },
        payment: {
          method: 'razorpay',
          status: 'completed',
          transactionId: 'TXN-INITIAL-1001'
        },
        orderStatus: 'delivered',
        statusHistory: [
          { status: 'placed', timestamp: new Date(Date.now() - 3600000), note: 'Order placed' },
          { status: 'confirmed', timestamp: new Date(Date.now() - 3300000), note: 'Confirmed by kitchen' },
          { status: 'preparing', timestamp: new Date(Date.now() - 2800000), note: 'Pizza in oven' },
          { status: 'ready_for_pickup', timestamp: new Date(Date.now() - 2000000), note: 'Packed hot' },
          { status: 'out_for_delivery', timestamp: new Date(Date.now() - 1500000), note: 'Rider on way' },
          { status: 'delivered', timestamp: new Date(Date.now() - 300000), note: 'Delivered at door' }
        ],
        isReviewed: true,
        couponApplied: 'WELCOME50'
      });

      // Sample Review
      await Review.create({
        user: {
          id: customer._id,
          name: customer.name,
          avatar: customer.avatar
        },
        restaurant: sampleRestaurant._id,
        order: sampleOrder._id,
        rating: 5,
        foodRating: 5,
        comment: 'Best woodfired pizza in Delhi! Crust was perfectly blistered, cheese was molten, and delivered steaming hot in 25 mins.',
        isVerified: true
      });

      // Sample Notification
      await Notification.create({
        user: customer._id,
        title: 'Welcome to FoodDelight! 🍊',
        message: 'Use coupon WELCOME50 on your first order to get 50% OFF up to ₹100.',
        type: 'offer',
        link: '/offers'
      });

      console.log('Sample order, review, and notification seeded.');
    }

    // 4. Seed Platform Settings
    let settings = await PlatformSettings.findOne();
    if (!settings) {
      settings = await PlatformSettings.create({
        platformName: 'FoodDelight',
        platformTagline: 'Premium Culinary Delivery Network',
        supportEmail: 'support@fooddelight.com',
        supportPhone: '+91 1800 123 4567',
        defaultCommissionRate: 15,
        deliveryFeeBase: 3900,
        deliveryFeePerKm: 1000,
        taxRate: 5,
        minOrderAmount: 9900,
        freeDeliveryThreshold: 49900,
        maintenanceMode: false,
        serviceableCities: ['Delhi', 'Noida', 'Gurugram', 'Bengaluru', 'Mumbai'],
        updatedBy: admin._id
      });
      console.log('Platform settings seeded.');
    }

    // 5. Seed Global Food Categories
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      const defaultCategories = [
        { name: 'Pizza & Italian', slug: 'pizza-italian', iconName: 'Pizza', displayOrder: 1, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300' },
        { name: 'Burgers & Fast Food', slug: 'burgers-fast-food', iconName: 'Beef', displayOrder: 2, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300' },
        { name: 'North Indian & Curries', slug: 'north-indian-curries', iconName: 'UtensilsCrossed', displayOrder: 3, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300' },
        { name: 'Biryani & Kebabs', slug: 'biryani-kebabs', iconName: 'Flame', displayOrder: 4, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300' },
        { name: 'Asian & Noodles', slug: 'asian-noodles', iconName: 'Soup', displayOrder: 5, image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300' },
        { name: 'Desserts & Bakes', slug: 'desserts-bakes', iconName: 'Cake', displayOrder: 6, image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300' },
        { name: 'Beverages & Shakes', slug: 'beverages-shakes', iconName: 'Coffee', displayOrder: 7, image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300' },
        { name: 'Healthy & Salads', slug: 'healthy-salads', iconName: 'Salad', displayOrder: 8, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300' }
      ];
      await Category.insertMany(defaultCategories);
      console.log('Seeded 8 global food categories.');
    }

    // 6. Seed Support Tickets if empty
    const ticketCount = await SupportTicket.countDocuments();
    if (ticketCount === 0 && customer) {
      const order = await Order.findOne({ user: customer._id });
      await SupportTicket.create({
        ticketNumber: 'TKT-1001',
        user: customer._id,
        order: order ? order._id : undefined,
        subject: 'Delivery delayed past promised ETA',
        category: 'delivery_delay',
        description: 'My order took 15 minutes longer than the estimated delivery time. Food was slightly warm.',
        status: 'open',
        priority: 'medium',
        messages: [
          {
            sender: 'customer',
            senderName: customer.name,
            message: 'Hello, the rider arrived late and the pizza was not hot.'
          }
        ]
      });

      await SupportTicket.create({
        ticketNumber: 'TKT-1002',
        user: customer._id,
        subject: 'Double charge on UPI payment',
        category: 'payment_issue',
        description: 'UPI debited twice for order #FD-2026-0001. Please issue refund for duplicate charge.',
        status: 'in_progress',
        priority: 'high',
        messages: [
          {
            sender: 'customer',
            senderName: customer.name,
            message: 'My bank statement shows ₹450 deducted twice.'
          },
          {
            sender: 'support',
            senderName: 'Kavita Sen (Support)',
            message: 'We have initiated a verification with our payment gateway partner. You will receive an update shortly.'
          }
        ]
      });
      console.log('Sample support tickets seeded.');
    }

    // 7. Seed Sample Refund if empty
    const refundCount = await Refund.countDocuments();
    if (refundCount === 0 && customer) {
      const sampleOrder = await Order.findOne();
      if (sampleOrder) {
        await Refund.create({
          order: sampleOrder._id,
          orderNumber: sampleOrder.orderNumber,
          customer: customer._id,
          amount: 25000, // ₹250.00
          reason: 'Item missing from order bag (Garlic Breadsticks)',
          status: 'pending',
          refundMethod: 'original_source'
        });
        console.log('Sample refund record seeded.');
      }
    }

    // 8. Seed Initial Audit Logs if empty
    const auditCount = await AuditLog.countDocuments();
    if (auditCount === 0 && admin) {
      await AuditLog.create({
        admin: admin._id,
        adminName: admin.name,
        adminEmail: admin.email,
        adminRole: 'super_admin',
        action: 'system_initialization',
        targetType: 'Settings',
        targetName: 'Platform Core',
        reason: 'FoodDelight system admin portal initialized and verified',
        details: { version: '2.0.0', environment: 'production-ready' },
        ipAddress: '127.0.0.1'
      });
      console.log('Initial system audit log created.');
    }

    console.log('FoodDelight database seeded successfully!');
  } catch (err) {
    console.error('Error seeding database:', err);
  }
};

module.exports = seedDatabase;

