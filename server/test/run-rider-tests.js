require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const http = require('http');
const app = require('../src/app');
const { connectDB } = require('../src/config/db');
const { initSocket } = require('../src/config/socket');
const seedDatabase = require('../src/utils/seeder');

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}/api/v1/rider`;

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

async function startAndTest() {
  console.log('Connecting to MongoDB & seeding...');
  await connectDB();
  await seedDatabase();

  const server = http.createServer(app);
  initSocket(server);

  await new Promise((res) => server.listen(PORT, res));
  console.log(`Server listening on port ${PORT}. Starting test suite...\n`);

  let riderToken = null;
  let testPass = 0;
  let testFail = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      testPass++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      testFail++;
    }
  }

  try {
    // 1. Rider Login
    console.log('Test 1: POST /auth/login (Demo Rider Credentials)');
    const loginRes = await request('POST', '/auth/login', {
      email: 'rider@fooddelight.com',
      password: 'rider123'
    });
    assert(loginRes.status === 200, `Login response status is 200 (got ${loginRes.status})`);
    assert(loginRes.data.success === true, 'Login success flag is true');
    assert(Boolean(loginRes.data.token), 'JWT Token returned');
    riderToken = loginRes.data.token;

    // 2. Rider Registration
    console.log('\nTest 2: POST /auth/register (New Partner Application)');
    const uniqueEmail = `rider_${Date.now()}@testrider.com`;
    const regRes = await request('POST', '/auth/register', {
      name: 'Speedy Rider',
      email: uniqueEmail,
      phone: '+91 99887 66554',
      password: 'password123',
      vehicleType: 'Motorcycle',
      vehicleNumber: 'DL-09-XY-9999',
      licenseNumber: 'DL999888777',
      preferredArea: 'South Delhi'
    });
    assert(regRes.status === 201, `Registration status is 201 (got ${regRes.status})`);
    assert(regRes.data.success === true, 'Registration success is true');

    // 3. Get /auth/me
    console.log('\nTest 3: GET /auth/me (Protected Route)');
    const meRes = await request('GET', '/auth/me', null, riderToken);
    assert(meRes.status === 200, `Status is 200 (got ${meRes.status})`);
    assert(meRes.data.data?.email === 'rider@fooddelight.com', 'Me endpoint returns correct rider user');

    // 4. Get /profile
    console.log('\nTest 4: GET /profile (Rider Profile & Verification Status)');
    const profRes = await request('GET', '/profile', null, riderToken);
    assert(profRes.status === 200, `Status is 200 (got ${profRes.status})`);
    assert(profRes.data.data?.vehicleType === 'Motorcycle', 'Profile has vehicle type');
    assert(profRes.data.data?.verificationStatus === 'approved', 'Demo rider is approved');

    // 5. Update /profile
    console.log('\nTest 5: PUT /profile (Update Preferred Area)');
    const updateProfRes = await request('PUT', '/profile', {
      preferredArea: 'Connaught Place & Central'
    }, riderToken);
    assert(updateProfRes.status === 200, `Status is 200 (got ${updateProfRes.status})`);
    assert(updateProfRes.data.data?.preferredArea === 'Connaught Place & Central', 'Profile updated preferred area');

    // 6. Update /profile/bank
    console.log('\nTest 6: PUT /profile/bank (Update Bank Details)');
    const bankRes = await request('PUT', '/profile/bank', {
      accountHolderName: 'Rahul Sharma',
      accountNumber: '987654321012',
      ifscCode: 'HDFC0001234',
      bankName: 'HDFC Bank'
    }, riderToken);
    assert(bankRes.status === 200, `Status is 200 (got ${bankRes.status})`);
    assert(bankRes.data.data?.bankDetails?.accountNumber === '987654321012', 'Bank account updated');

    // 7. Get /dashboard/overview
    console.log('\nTest 7: GET /dashboard/overview (KPIs and Metrics)');
    const dashRes = await request('GET', '/dashboard/overview', null, riderToken);
    assert(dashRes.status === 200, `Status is 200 (got ${dashRes.status})`);
    assert(dashRes.data.data !== undefined, 'Dashboard data object returned');
    assert(typeof dashRes.data.data?.todayDeliveries === 'number', 'todayDeliveries is numeric');

    // 8. Toggle /availability/toggle
    console.log('\nTest 8: PATCH /availability/toggle (Online/Offline State)');
    const toggleRes = await request('PATCH', '/availability/toggle', null, riderToken);
    assert(toggleRes.status === 200, `Status is 200 (got ${toggleRes.status})`);
    assert(typeof toggleRes.data.data?.isOnline === 'boolean', 'isOnline is a boolean');

    // Toggle back to online
    if (!toggleRes.data.data?.isOnline) {
      await request('PATCH', '/availability/toggle', null, riderToken);
    }

    // 9. Get /deliveries/requests
    console.log('\nTest 9: GET /deliveries/requests (Available Delivery Requests)');
    const reqRes = await request('GET', '/deliveries/requests', null, riderToken);
    assert(reqRes.status === 200, `Status is 200 (got ${reqRes.status})`);
    assert(Array.isArray(reqRes.data.data), 'Returns an array of requests');

    // 10. Get /deliveries/active
    console.log('\nTest 10: GET /deliveries/active (Current Active Delivery)');
    const activeRes = await request('GET', '/deliveries/active', null, riderToken);
    assert(activeRes.status === 200 || activeRes.status === 404, `Active delivery status is 200 or 404 (got ${activeRes.status})`);

    // 11. GPS Location Update
    console.log('\nTest 11: POST /location (Live GPS Update)');
    const locRes = await request('POST', '/location', {
      latitude: 28.6139,
      longitude: 77.2090,
      heading: 90,
      speed: 25,
      batteryLevel: 85
    }, riderToken);
    assert(locRes.status === 200, `Status is 200 (got ${locRes.status})`);

    // 12. GET /location
    console.log('\nTest 12: GET /location (Retrieve Location)');
    const getLocRes = await request('GET', '/location', null, riderToken);
    assert(getLocRes.status === 200, `Status is 200 (got ${getLocRes.status})`);
    assert(getLocRes.data.data?.location?.coordinates[1] === 28.6139, 'Latitude saved correctly');

    // 13. GET /earnings/summary
    console.log('\nTest 13: GET /earnings/summary (Financial Breakdown)');
    const earnRes = await request('GET', '/earnings/summary', null, riderToken);
    assert(earnRes.status === 200, `Status is 200 (got ${earnRes.status})`);
    assert(earnRes.data.data !== undefined || earnRes.data.summary !== undefined, 'Earnings summary returned');

    // 14. GET /history
    console.log('\nTest 14: GET /history (Delivery History)');
    const histRes = await request('GET', '/history?page=1&limit=5', null, riderToken);
    assert(histRes.status === 200, `Status is 200 (got ${histRes.status})`);
    assert(Array.isArray(histRes.data.data), 'History returns an array of records');

    // 15. GET /notifications
    console.log('\nTest 15: GET /notifications (Rider Alerts)');
    const notifRes = await request('GET', '/notifications', null, riderToken);
    assert(notifRes.status === 200, `Status is 200 (got ${notifRes.status})`);
    assert(Array.isArray(notifRes.data.data), 'Notifications returns an array');

    // 16. PATCH /notifications/read
    console.log('\nTest 16: PATCH /notifications/read (Mark All Read)');
    const readRes = await request('PATCH', '/notifications/read', null, riderToken);
    assert(readRes.status === 200, `Status is 200 (got ${readRes.status})`);
    assert(readRes.data.success === true, 'Success flag is true');

  } catch (err) {
    console.error('Test execution error:', err);
    testFail++;
  }

  console.log('\n====================================================');
  console.log(`  FINAL RESULTS: ${testPass} PASSED, ${testFail} FAILED`);
  console.log('====================================================\n');

  server.close();
  const mongoose = require('mongoose');
  await mongoose.disconnect();
  process.exit(testFail > 0 ? 1 : 0);
}

startAndTest().catch(e => {
  console.error('Startup error:', e);
  process.exit(1);
});

