const http = require('http');

const BASE_URL = 'http://localhost:5000/api';

// Helper for making requests
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

async function runTestSuite() {
  console.log('\n======================================================');
  console.log('       FOODDELIGHT API INTEGRATION TEST SUITE         ');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Health
    const health = await new Promise((res, rej) => {
      http.get('http://localhost:5000/health', (r) => {
        let body = '';
        r.on('data', (c) => (body += c));
        r.on('end', () => res(JSON.parse(body)));
      }).on('error', rej);
    });
    assert(health.status === 'ok', 'Server health check returns 200 OK');

    // 2. Auth Login
    const login = await request('POST', '/auth/login', {
      email: 'demo@fooddelight.com',
      password: 'password123'
    });
    assert(login.status === 200 && login.data.token, 'Customer login returns valid JWT token');
    const token = login.data.token;
    const userId = login.data.user._id;

    // 3. Auth Me
    const me = await request('GET', '/auth/me', null, token);
    assert(me.status === 200 && me.data.user.email === 'demo@fooddelight.com', 'Protected /auth/me returns customer profile');

    // 4. Restaurant Listing & Filtering
    const allRests = await request('GET', '/restaurants');
    assert(allRests.status === 200 && allRests.data.count > 0, `Fetch all restaurants returned ${allRests.data.count} items`);

    const vegRests = await request('GET', '/restaurants?vegOnly=true');
    assert(vegRests.status === 200 && vegRests.data.data.every((r) => r.isPureVeg), 'Veg filter returns only pure-veg certified kitchens');

    // 5. Curated Homepage
    const curated = await request('GET', '/restaurants/curated/home');
    assert(curated.status === 200 && curated.data.data.popular.length > 0, 'Curated homepage showcases top-rated restaurants');

    // 6. Restaurant Details & Menu Categories
    const sampleSlug = allRests.data.data[0].slug;
    const restDetails = await request('GET', `/restaurants/${sampleSlug}`);
    assert(restDetails.status === 200 && restDetails.data.data.menuByCategory.length > 0, `Restaurant menu returned ${restDetails.data.data.menuByCategory.length} categories`);
    const dish = restDetails.data.data.menuByCategory[0].items[0];

    // 7. Menu Search
    const searchDishes = await request('GET', `/menu-items/search?q=${encodeURIComponent(dish.name.split(' ')[0])}`);
    assert(searchDishes.status === 200 && searchDishes.data.count > 0, `Menu search for "${dish.name.split(' ')[0]}" returned matching dishes`);

    // 8. Smart Shopping Cart
    await request('DELETE', '/cart', null, token); // clear first
    const cartAdd = await request(
      'POST',
      '/cart/items',
      {
        menuItemId: dish._id,
        quantity: 1,
        specialInstructions: 'Test instruction'
      },
      token
    );
    assert(cartAdd.status === 200 && cartAdd.data.data.items.length === 1, 'Add item to smart cart succeeds');

    // 9. Coupon Application
    const couponApply = await request('POST', '/cart/coupon', { code: 'WELCOME50' }, token);
    assert(couponApply.status === 200 && couponApply.data.data.appliedCoupon.code === 'WELCOME50', 'Apply coupon WELCOME50 succeeds with discount deduction');

    // 10. Address Management
    const addresses = await request('GET', '/addresses', null, token);
    assert(addresses.status === 200 && addresses.data.count > 0, `Get saved addresses returned ${addresses.data.count} address`);
    const address = addresses.data.data[0];

    // 11. Wishlist Toggle
    const wishlistToggle = await request('POST', `/wishlist/restaurants/${allRests.data.data[0]._id}`, null, token);
    assert(wishlistToggle.status === 200, 'Toggle restaurant in customer wishlist succeeds');

    // 12. Create Order & Lifecycle Tracking
    const orderCreate = await request(
      'POST',
      '/orders',
      {
        addressId: address._id,
        paymentMethod: 'cod',
        specialInstructions: 'Integration test delivery'
      },
      token
    );
    assert(orderCreate.status === 201 && orderCreate.data.data.orderStatus === 'placed', `Order created successfully: #${orderCreate.data.data.orderNumber}`);
    const order = orderCreate.data.data;

    // Simulate advancing to confirmed
    const simOrder = await request('POST', `/orders/${order._id}/simulate-status`, null, token);
    assert(simOrder.status === 200 && simOrder.data.data.orderStatus === 'confirmed', 'Order tracking status advanced to confirmed');

    // 13. Customer Support Tickets & FAQs
    const faqs = await request('GET', '/support/faqs');
    assert(faqs.status === 200 && faqs.data.data.length > 0, 'Support FAQ list retrieved successfully');

    const ticket = await request(
      'POST',
      '/support/tickets',
      {
        subject: 'Delivery Query',
        category: 'delivery_delay',
        description: 'How soon will my order arrive?'
      },
      token
    );
    assert(ticket.status === 201 && ticket.data.data.ticketNumber, `Support ticket created: ${ticket.data.data.ticketNumber}`);

    console.log('\n------------------------------------------------------');
    console.log(`Tests Passed: ${passed} | Tests Failed: ${failed}`);
    console.log('======================================================\n');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  }
}

runTestSuite();

