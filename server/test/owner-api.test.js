const http = require('http');

const BASE_URL = 'http://localhost:5000/api/v1/owner';

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const data = body ? JSON.stringify(body) : null;
    if (data) headers['Content-Length'] = Buffer.byteLength(data);

    const req = http.request(
      url,
      { method, headers },
      (res) => {
        let responseData = '';
        res.on('data', (chunk) => (responseData += chunk));
        res.on('end', () => {
          try {
            const parsed = responseData ? JSON.parse(responseData) : {};
            resolve({ status: res.statusCode, data: parsed, headers: res.headers });
          } catch (e) {
            resolve({ status: res.statusCode, raw: responseData, headers: res.headers });
          }
        });
      }
    );

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function customerRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL('http://localhost:5000/api' + path);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const data = body ? JSON.stringify(body) : null;
    if (data) headers['Content-Length'] = Buffer.byteLength(data);

    const req = http.request(
      url,
      { method, headers },
      (res) => {
        let responseData = '';
        res.on('data', (chunk) => (responseData += chunk));
        res.on('end', () => {
          try {
            const parsed = responseData ? JSON.parse(responseData) : {};
            resolve({ status: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, raw: responseData });
          }
        });
      }
    );

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runOwnerTestSuite() {
  console.log('\n======================================================');
  console.log('   FOODDELIGHT RESTAURANT OWNER PORTAL TEST SUITE     ');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;
  let ownerToken = null;
  let customerToken = null;
  let createdItemId = null;
  let testOrderId = null;
  let testPromoId = null;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}\n`);
      failed++;
    }
  }

  // 1. Owner Login
  await test('POST /auth/login - Owner login with valid credentials', async () => {
    const res = await request('POST', '/auth/login', {
      email: 'owner@fooddelight.com',
      password: 'owner123'
    });
    if (res.status !== 200 || !res.data.token) {
      throw new Error(`Expected 200 with token, got ${res.status}: ${JSON.stringify(res.data)}`);
    }
    ownerToken = res.data.token;
    if (res.data.user.role !== 'restaurant_owner') {
      throw new Error(`Expected role restaurant_owner, got ${res.data.user.role}`);
    }
  });

  // 2. Owner Registration
  await test('POST /auth/register - Register new restaurant owner with pending status', async () => {
    const uniqueEmail = `chef_${Date.now()}@fooddelight.com`;
    const res = await request('POST', '/auth/register', {
      name: 'Chef Alessandro',
      email: uniqueEmail,
      phone: '+91 99999 11111',
      password: 'password123',
      restaurantName: `Bella Cucina ${Date.now()}`,
      cuisine: ['Italian', 'Continental']
    });
    if (res.status !== 201 || !res.data.success) {
      throw new Error(`Expected 201, got ${res.status}: ${JSON.stringify(res.data)}`);
    }
    if (res.data.restaurant.approvalStatus !== 'pending') {
      throw new Error('New restaurant should have pending approvalStatus');
    }
  });

  // 3. Security: Customer Role cannot access Owner Portal
  await test('GET /dashboard/stats - Block customer from owner dashboard (403)', async () => {
    // Login as customer
    const custRes = await customerRequest('POST', '/auth/login', {
      email: 'demo@fooddelight.com',
      password: 'password123'
    });
    customerToken = custRes.data.token;

    const res = await request('GET', '/dashboard/stats', null, customerToken);
    if (res.status !== 403) {
      throw new Error(`Expected 403 Forbidden for customer role, got ${res.status}`);
    }
  });

  // 4. Dashboard Stats
  await test('GET /dashboard/stats - Retrieve owner dashboard metrics and sales chart', async () => {
    const res = await request('GET', '/dashboard/stats?period=daily', null, ownerToken);
    if (res.status !== 200 || !res.data.stats) {
      throw new Error(`Expected 200 with stats, got ${res.status}`);
    }
    if (!Array.isArray(res.data.chartData) || !Array.isArray(res.data.statusDistribution)) {
      throw new Error('Expected chartData and statusDistribution arrays');
    }
  });

  // 5. Restaurant Profile GET
  await test('GET /restaurant/profile - Fetch owner restaurant profile', async () => {
    const res = await request('GET', '/restaurant/profile', null, ownerToken);
    if (res.status !== 200 || !res.data.restaurant) {
      throw new Error(`Expected 200 with restaurant profile, got ${res.status}`);
    }
  });

  // 6. Restaurant Profile UPDATE
  await test('PUT /restaurant/profile - Update restaurant operating details', async () => {
    const res = await request('PUT', '/restaurant/profile', {
      preparationTime: 28,
      description: 'Authentic stone oven pizzas and gourmet Italian delicacies.'
    }, ownerToken);
    if (res.status !== 200 || res.data.restaurant.preparationTime !== 28) {
      throw new Error(`Expected 200 with updated prep time, got ${res.status}`);
    }
  });

  // 7. Restaurant Availability Toggle
  await test('PATCH /restaurant/status - Toggle open/closed state', async () => {
    const res = await request('PATCH', '/restaurant/status', {
      isOpen: true,
      isTemporarilyClosed: false
    }, ownerToken);
    if (res.status !== 200 || res.data.isOpen !== true) {
      throw new Error(`Expected 200 with isOpen: true, got ${res.status}`);
    }
  });

  // 8. Menu: Add Food Item
  await test('POST /menu - Add new food item to restaurant menu', async () => {
    const res = await request('POST', '/menu', {
      name: `Signature Truffle Pizza ${Date.now()}`,
      description: 'White sauce pizza topped with wild porcini mushrooms and black truffle cream.',
      price: 54900, // ₹549
      category: 'Pizza',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500',
      isVeg: true,
      isBestseller: true,
      sizes: [
        { name: 'Regular 7"', priceDelta: 0 },
        { name: 'Medium 10"', priceDelta: 15000 }
      ],
      addOns: [
        { name: 'Extra Truffle Glaze', price: 6900 }
      ]
    }, ownerToken);

    if (res.status !== 201 || !res.data.item) {
      throw new Error(`Expected 201 with created item, got ${res.status}: ${JSON.stringify(res.data)}`);
    }
    createdItemId = res.data.item._id;
  });

  // 9. Menu: List Items
  await test('GET /menu - List menu items with category filtering', async () => {
    const res = await request('GET', '/menu?category=Pizza', null, ownerToken);
    if (res.status !== 200 || !Array.isArray(res.data.items)) {
      throw new Error(`Expected 200 with items array, got ${res.status}`);
    }
  });

  // 10. Menu: Toggle Availability
  await test('PATCH /menu/:id/availability - Toggle item stock status', async () => {
    const res = await request('PATCH', `/menu/${createdItemId}/availability`, null, ownerToken);
    if (res.status !== 200 || res.data.isAvailable === undefined) {
      throw new Error(`Expected 200 with isAvailable, got ${res.status}`);
    }
  });

  // 11. Orders: List Orders
  await test('GET /orders - List orders with status counts', async () => {
    const res = await request('GET', '/orders', null, ownerToken);
    if (res.status !== 200 || !res.data.counts) {
      throw new Error(`Expected 200 with order counts, got ${res.status}`);
    }
    if (res.data.orders.length > 0) {
      testOrderId = res.data.orders[0]._id;
    }
  });

  // 12. Orders: Order Lifecycle (Accept, Prepare, Ready)
  await test('PUT /orders/:id/accept | prepare | ready - Order state progression', async () => {
    const ordersRes = await request('GET', '/orders?status=placed', null, ownerToken);
    let orderId = ordersRes.data.orders?.[0]?._id;

    if (orderId) {
      const acceptRes = await request('PUT', `/orders/${orderId}/accept`, { prepTimeMinutes: 25 }, ownerToken);
      if (acceptRes.status !== 200 || acceptRes.data.order.orderStatus !== 'confirmed') {
        throw new Error(`Expected confirmed status, got ${acceptRes.status}`);
      }

      const prepRes = await request('PUT', `/orders/${orderId}/prepare`, null, ownerToken);
      if (prepRes.status !== 200 || prepRes.data.order.orderStatus !== 'preparing') {
        throw new Error(`Expected preparing status, got ${prepRes.status}`);
      }

      const readyRes = await request('PUT', `/orders/${orderId}/ready`, null, ownerToken);
      if (readyRes.status !== 200 || readyRes.data.order.orderStatus !== 'ready_for_pickup') {
        throw new Error(`Expected ready_for_pickup status, got ${readyRes.status}`);
      }
    }
  });

  // 13. Customer Reviews: GET & Reply
  await test('GET /reviews & POST /reviews/:id/reply - Review management', async () => {
    const res = await request('GET', '/reviews', null, ownerToken);
    if (res.status !== 200 || !Array.isArray(res.data.reviews)) {
      throw new Error(`Expected 200 with reviews array, got ${res.status}`);
    }

    if (res.data.reviews.length > 0) {
      const reviewId = res.data.reviews[0]._id;
      const replyRes = await request('POST', `/reviews/${reviewId}/reply`, {
        message: 'Thank you for dining with us! We look forward to your next order.'
      }, ownerToken);
      if (replyRes.status !== 200 || !replyRes.data.review.reply) {
        throw new Error(`Expected 200 with reply, got ${replyRes.status}`);
      }
    }
  });

  // 14. Promotions: Create & List
  await test('POST & GET /promotions - Restaurant coupon management', async () => {
    const promoCode = `CHEF${Math.floor(Math.random() * 899 + 100)}`;
    const createRes = await request('POST', '/promotions', {
      code: promoCode,
      description: 'Exclusive 20% off on all pizzas',
      discountPercentage: 20,
      maxDiscount: 10000,
      minOrderValue: 29900,
      expiresAt: new Date(Date.now() + 30 * 86400000)
    }, ownerToken);

    if (createRes.status !== 201 || !createRes.data.promotion) {
      throw new Error(`Expected 201 with promotion, got ${createRes.status}`);
    }
    testPromoId = createRes.data.promotion._id;

    const listRes = await request('GET', '/promotions', null, ownerToken);
    if (listRes.status !== 200 || !Array.isArray(listRes.data.promotions)) {
      throw new Error(`Expected 200 with promotions list, got ${listRes.status}`);
    }
  });

  // 15. Earnings: Summary & CSV Export
  await test('GET /earnings/summary & /export - Financial summary & CSV generation', async () => {
    const summaryRes = await request('GET', '/earnings/summary', null, ownerToken);
    if (summaryRes.status !== 200 || !summaryRes.data.summary) {
      throw new Error(`Expected 200 with summary, got ${summaryRes.status}`);
    }
    if (summaryRes.data.summary.commissionPercentage !== 15) {
      throw new Error(`Expected 15% platform commission, got ${summaryRes.data.summary.commissionPercentage}`);
    }

    const exportRes = await request('GET', '/earnings/export', null, ownerToken);
    if (exportRes.status !== 200 || !exportRes.headers['content-type']?.includes('text/csv')) {
      throw new Error(`Expected 200 text/csv, got ${exportRes.status}`);
    }
  });

  // 16. Menu item delete cleanup
  if (createdItemId) {
    await test('DELETE /menu/:id - Delete food item', async () => {
      const res = await request('DELETE', `/menu/${createdItemId}`, null, ownerToken);
      if (res.status !== 200) {
        throw new Error(`Expected 200 for delete, got ${res.status}`);
      }
    });
  }

  console.log('\n======================================================');
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runOwnerTestSuite();
