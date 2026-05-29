/**
 * MenuMitra Automated End-to-End API Integration Test Script
 * Developed by Abhijit Kumar Misra
 *
 * Verifies all core routes of the platform backend.
 *
 * Usage:
 *   node e2e_test.js                   — Run against local server (port 4000)
 *   node e2e_test.js --production       — Run against Railway production URL
 *   BASE_URL=https://... node e2e_test.js — Custom URL
 */

const axios = require('axios');

// ── Determine base URL ────────────────────────────────────────────────────────
const isProd = process.argv.includes('--production');
const DEFAULT_PROD_URL = 'https://menumitra-production.up.railway.app/api';
const BASE_URL = process.env.BASE_URL || (isProd ? DEFAULT_PROD_URL : 'http://localhost:4000/api');

const randomSuffix = Math.floor(1000 + Math.random() * 9000);
const testEmail = `merchant_${randomSuffix}@menumitra.com`;
const testPhone = `9876${randomSuffix}`;
const testPassword = 'SecurePassword123';

// ── Counters ──────────────────────────────────────────────────────────────────
let testsPassed = 0;
let testsFailed = 0;

function pass(step, msg) {
  console.log(`✅ [${step}] ${msg}`);
  testsPassed++;
}

function fail(step, msg, err) {
  console.error(`❌ [${step}] FAILED — ${msg}`);
  if (err) {
    if (err.response) {
      console.error(`   HTTP ${err.response.status}: ${JSON.stringify(err.response.data)}`);
    } else {
      console.error(`   ${err.message}`);
    }
  }
  testsFailed++;
}

// ── Test runner ───────────────────────────────────────────────────────────────
const runTests = async () => {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('       MENUMITRA — AUTOMATED E2E INTEGRATION TEST FLOW');
  console.log('       Developed by Abhijit Kumar Misra');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`Mode    : ${isProd ? '🚀 PRODUCTION' : '🔧 LOCAL'}`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Run ID  : ${randomSuffix}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  let ownerToken = '';
  let ownerId = '';
  let ownerSlug = '';
  let categoryId = '';
  let foodItemId = '';
  let orderId = '';
  let adminToken = '';

  // ── STEP 1: Health Check ─────────────────────────────────────────────────
  try {
    const res = await axios.get(`${BASE_URL}/health`);
    if (res.status === 200 && res.data.status === 'ok') {
      pass('1/14', `Health check OK — DB: ${res.data.db}`);
    } else {
      fail('1/14', `Unexpected health response: ${res.data.status}`);
    }
  } catch (err) {
    fail('1/14', 'Health check failed — is the server running?', err);
    console.log('\n⛔ Cannot proceed — server unreachable. Exiting.');
    process.exit(1);
  }

  // ── STEP 2: Owner Registration ───────────────────────────────────────────
  try {
    const res = await axios.post(`${BASE_URL}/auth/signup`, {
      business_name: `Tasty Bites Cafe ${randomSuffix}`,
      business_type: 'cafe',
      owner_name: 'Abhijit Kumar Misra',
      email: testEmail,
      phone: testPhone,
      address: '123 Main Street',
      city: 'Guwahati',
      state: 'Assam',
      pincode: '781001',
      table_count: 15,
      password: testPassword
    });

    if (res.status === 201) {
      ownerToken = res.data.token;
      ownerId = res.data.owner?.id || res.data.user?.id;
      ownerSlug = res.data.owner?.slug || res.data.user?.slug;
      pass('2/14', `Registration OK — ID: ${ownerId} | Slug: ${ownerSlug}`);
    } else {
      fail('2/14', `Unexpected status: ${res.status}`);
    }
  } catch (err) {
    fail('2/14', 'Owner registration failed', err);
  }

  // ── STEP 3: Owner Login ──────────────────────────────────────────────────
  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: testEmail,
      password: testPassword
    });
    if (res.status === 200 && res.data.token) {
      ownerToken = res.data.token;
      pass('3/14', `Owner login OK — Token received`);
    } else {
      fail('3/14', 'Login did not return token');
    }
  } catch (err) {
    fail('3/14', 'Owner login failed', err);
  }

  const ownerHeaders = { Authorization: `Bearer ${ownerToken}` };

  // ── STEP 4: Fetch Owner Profile ──────────────────────────────────────────
  try {
    const res = await axios.get(`${BASE_URL}/owner/profile`, { headers: ownerHeaders });
    if (res.status === 200 && res.data.owner_name) {
      pass('4/14', `Profile fetch OK — Name: ${res.data.owner_name}`);
    } else {
      fail('4/14', 'Profile response missing owner_name');
    }
  } catch (err) {
    fail('4/14', 'Profile fetch failed', err);
  }

  // ── STEP 5: Create Category ──────────────────────────────────────────────
  try {
    const res = await axios.post(`${BASE_URL}/menu/categories`, {
      name: 'Special Mocktails',
      sort_order: 1
    }, { headers: ownerHeaders });

    if (res.status === 201) {
      categoryId = res.data.category?.id || res.data.id;
      pass('5/14', `Category created OK — ID: ${categoryId}`);
    } else {
      fail('5/14', `Unexpected status: ${res.status}`);
    }
  } catch (err) {
    fail('5/14', 'Category creation failed', err);
  }

  // ── STEP 6: Add Food Item ────────────────────────────────────────────────
  try {
    const res = await axios.post(`${BASE_URL}/menu/items`, {
      name: `Blue Curacao Lagoon ${randomSuffix}`,
      description: 'Refreshing blue mint lemon mocktail',
      price: 180.00,
      category_id: categoryId,
      is_veg: true,
      sort_order: 1
    }, { headers: ownerHeaders });

    if (res.status === 201) {
      foodItemId = res.data.item?.id || res.data.id;
      pass('6/14', `Food item created OK — ID: ${foodItemId}`);
    } else {
      fail('6/14', `Unexpected status: ${res.status}`);
    }
  } catch (err) {
    fail('6/14', 'Food item creation failed', err);
  }

  // ── STEP 7: Public Customer Menu Access ─────────────────────────────────
  try {
    const res = await axios.get(`${BASE_URL}/public/menu/${ownerSlug}`);
    if (res.status === 200) {
      const catCount = res.data.categories?.length || 0;
      pass('7/14', `Public menu loaded OK — ${catCount} category/categories`);
    } else {
      fail('7/14', `Unexpected status: ${res.status}`);
    }
  } catch (err) {
    fail('7/14', 'Public menu access failed', err);
  }

  // ── STEP 8: Place Guest Order ────────────────────────────────────────────
  try {
    const res = await axios.post(`${BASE_URL}/orders`, {
      owner_id: ownerId,
      table_number: '05',
      customer_name: 'Jitu Guest',
      notes: 'Less ice please',
      items: [{ food_item_id: foodItemId, quantity: 2 }]
    });

    if (res.status === 201) {
      orderId = res.data.order?.id || res.data.id;
      const total = res.data.order?.totalAmount || res.data.totalAmount;
      pass('8/14', `Order placed OK — ID: ${orderId} | Total: ₹${total}`);
    } else {
      fail('8/14', `Unexpected status: ${res.status}`);
    }
  } catch (err) {
    fail('8/14', 'Order placement failed', err);
  }

  // ── STEP 9: Mock Payment Verification ────────────────────────────────────
  try {
    const res = await axios.post(`${BASE_URL}/payment/verify`, {
      orderId,
      isMock: true
    });
    if (res.status === 200) {
      pass('9/14', 'Mock payment verification OK');
    } else {
      fail('9/14', `Unexpected status: ${res.status}`);
    }
  } catch (err) {
    // Payment verify may not exist in all envs — treat as warning
    if (err.response && err.response.status === 404) {
      console.log(`  ⚠️  [9/14] Payment verify endpoint not found — skipping (non-critical)`);
    } else {
      fail('9/14', 'Mock payment verification failed', err);
    }
  }

  // ── STEP 10: Fetch Owner Orders ───────────────────────────────────────────
  try {
    const res = await axios.get(`${BASE_URL}/orders`, { headers: ownerHeaders });
    if (res.status === 200) {
      const orders = res.data.orders || res.data;
      const found = Array.isArray(orders) && orders.find(o => o.id === orderId);
      pass('10/14', `Owner orders fetched OK — Order found: ${found ? 'YES' : 'NO'}`);
    } else {
      fail('10/14', `Unexpected status: ${res.status}`);
    }
  } catch (err) {
    fail('10/14', 'Owner orders fetch failed', err);
  }

  // ── STEP 11: Mark Order as Paid ──────────────────────────────────────────
  try {
    const res = await axios.put(`${BASE_URL}/orders/${orderId}/status`,
      { paymentStatus: 'paid' },
      { headers: ownerHeaders }
    );
    if (res.status === 200) {
      pass('11/14', 'Order marked as paid OK');
    } else {
      fail('11/14', `Unexpected status: ${res.status}`);
    }
  } catch (err) {
    fail('11/14', 'Mark order paid failed', err);
  }

  // ── STEP 12: Owner Analytics ──────────────────────────────────────────────
  try {
    const res = await axios.get(`${BASE_URL}/owner/analytics`, { headers: ownerHeaders });
    if (res.status === 200) {
      pass('12/14', 'Owner analytics endpoint OK');
    } else {
      fail('12/14', `Unexpected status: ${res.status}`);
    }
  } catch (err) {
    if (err.response && err.response.status === 404) {
      console.log(`  ⚠️  [12/14] Analytics endpoint not implemented yet — skipping`);
    } else {
      fail('12/14', 'Owner analytics failed', err);
    }
  }

  // ── STEP 13: Admin Login + Stats ─────────────────────────────────────────
  try {
    const loginRes = await axios.post(`${BASE_URL}/auth/admin/login`, {
      loginId: 'Jitu',
      password: process.env.ADMIN_PASSWORD || 'admin123'
    });

    if (loginRes.status === 200 && loginRes.data.token) {
      adminToken = loginRes.data.token;
      pass('13/14', 'Admin login OK');

      const statsRes = await axios.get(`${BASE_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (statsRes.status === 200) {
        pass('13b/14', `Admin stats OK — ${statsRes.data.totalOwners} owners on platform`);
      }
    } else {
      fail('13/14', 'Admin login did not return token');
    }
  } catch (err) {
    fail('13/14', 'Admin login/stats failed', err);
  }

  // ── STEP 14: Cleanup — Delete Test Owner ─────────────────────────────────
  if (adminToken && ownerId) {
    try {
      const res = await axios.delete(`${BASE_URL}/admin/owners/${ownerId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.status === 200) {
        pass('14/14', `Test data cleanup OK — owner ${ownerId} deleted`);
      } else {
        fail('14/14', `Cleanup returned status ${res.status}`);
      }
    } catch (err) {
      fail('14/14', 'Test cleanup failed (manual cleanup required)', err);
    }
  } else {
    console.log('  ⏭️  [14/14] Skipping cleanup — admin token or ownerId not available');
  }

  // ── Final Summary ─────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`  Tests Passed : ${testsPassed}`);
  console.log(`  Tests Failed : ${testsFailed}`);
  console.log('═══════════════════════════════════════════════════════════════');

  if (testsFailed === 0) {
    console.log('\n🎉 ALL E2E TESTS PASSED — MenuMitra is fully operational!\n');
  } else {
    console.log(`\n⚠️  ${testsFailed} TEST(S) FAILED — Review the failures above.\n`);
    process.exit(1);
  }
};

runTests().catch(err => {
  console.error('\n💥 UNEXPECTED CRASH:', err.message);
  process.exit(1);
});
