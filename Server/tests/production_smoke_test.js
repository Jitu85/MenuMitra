/**
 * MenuMitra — Production Smoke Test
 * Developed by Abhijit Kumar Misra
 *
 * Read-only tests against the live production endpoints.
 * Does NOT create or mutate any data.
 *
 * Run with: node tests/production_smoke_test.js
 * Or via:   npm run test:smoke
 *
 * Environment variables:
 *   PROD_API_URL  — Railway backend URL (default: https://menumitra-production.up.railway.app)
 *   PROD_SLUG     — A real owner slug from production DB to test public menu
 *   PROD_ADMIN_PW — Admin password for smoke login (default: admin123)
 */

const https = require('https');
const http = require('http');

const PROD_API_URL = process.env.PROD_API_URL || 'https://menumitra-production.up.railway.app';
const PROD_SLUG = process.env.PROD_SLUG || ''; // Set to a real slug for full smoke test
const PROD_ADMIN_ID = process.env.PROD_ADMIN_ID || 'Jitu';
const PROD_ADMIN_PW = process.env.PROD_ADMIN_PW || 'admin123';

// ── HTTP helper ──────────────────────────────────────────────────────────────
function makeRequest({ method = 'GET', baseUrl, path, body = null, headers = {} }) {
  return new Promise((resolve) => {
    const url = new URL(baseUrl + path);
    const isHttps = url.protocol === 'https:';
    const protocol = isHttps ? https : http;

    const bodyStr = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': 'MenuMitra-SmokeTest/1.0',
      ...headers
    };
    if (bodyStr) {
      reqHeaders['Content-Length'] = Buffer.byteLength(bodyStr);
    }

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: reqHeaders
    };

    const req = protocol.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(data); } catch (_) {}
        resolve({ status: res.statusCode, body: parsed, raw: data });
      });
    });

    req.on('error', (err) => {
      resolve({ status: 0, body: null, error: err.message });
    });

    req.setTimeout(15000, () => {
      req.destroy();
      resolve({ status: 0, body: null, error: 'Request timeout (15s)' });
    });

    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

// ── Smoke check runner ────────────────────────────────────────────────────────
let smokePassed = 0;
let smokeFailed = 0;

function smokeCheck(name, condition, got = '', expected = '') {
  if (condition) {
    console.log(`  ✅ ${name}`);
    smokePassed++;
  } else {
    const detail = got ? ` [got: ${got}${expected ? `, expected: ${expected}` : ''}]` : '';
    console.log(`  ❌ ${name}${detail}`);
    smokeFailed++;
  }
}

// ── Production Smoke Test ─────────────────────────────────────────────────────
async function runSmokeTest() {
  const req = (opts) => makeRequest({ baseUrl: PROD_API_URL, ...opts });

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('     MENUMITRA PRODUCTION SMOKE TEST — Abhijit Kumar Misra');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`Production API : ${PROD_API_URL}`);
  console.log(`Test Slug      : ${PROD_SLUG || '(not set — skipping public menu test)'}`);
  console.log(`Timestamp      : ${new Date().toISOString()}`);
  console.log('');

  // ── 1. Health Check ────────────────────────────────────────────────────────
  console.log('[ 1/5 ] Backend Health Check...');
  const health = await req({ path: '/api/health' });
  smokeCheck('API is reachable', health.status === 200, health.status, 200);
  smokeCheck('Database connected', health.body && health.body.db === 'connected',
    health.body && health.body.db, 'connected');
  if (health.error) {
    console.log(`  ⚠️  Connection error: ${health.error}`);
    console.log('\n❌ SMOKE TESTS ABORTED — Cannot reach production server.');
    process.exit(1);
  }

  // ── 2. Root Route ──────────────────────────────────────────────────────────
  console.log('\n[ 2/5 ] Root route...');
  const root = await req({ path: '/' });
  smokeCheck('Root route returns 200', root.status === 200, root.status, 200);
  smokeCheck('Response mentions MenuMitra',
    !!(root.body && (root.body.message || '').includes('MenuMitra')));

  // ── 3. Admin Login (read-only smoke) ───────────────────────────────────────
  console.log('\n[ 3/5 ] Admin Login...');
  const adminLogin = await req({
    method: 'POST',
    path: '/api/auth/admin/login',
    body: { loginId: PROD_ADMIN_ID, password: PROD_ADMIN_PW }
  });
  const adminOk = adminLogin.status === 200 && adminLogin.body && adminLogin.body.token;
  smokeCheck('Admin can login', adminOk, adminLogin.status, 200);

  if (adminOk) {
    const adminToken = adminLogin.body.token;
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };

    // ── 4. Admin Stats ──────────────────────────────────────────────────────
    console.log('\n[ 4/5 ] Admin Dashboard Stats...');
    const stats = await req({ path: '/api/admin/stats', headers: adminHeaders });
    smokeCheck('Admin stats endpoint returns 200', stats.status === 200, stats.status, 200);
    smokeCheck('Stats has totalOwners field', stats.body && typeof stats.body.totalOwners === 'number');
    smokeCheck('Stats has totalOrders field', stats.body && typeof stats.body.totalOrders === 'number');
    if (stats.body) {
      console.log(`  ℹ️  Platform: ${stats.body.totalOwners} owners, ${stats.body.totalOrders} orders`);
    }
  } else {
    console.log('  ⏭️  Skipping admin stats — login failed');
    smokeFailed += 3;
  }

  // ── 5. Public Menu Endpoint ────────────────────────────────────────────────
  console.log('\n[ 5/5 ] Public Menu Access...');
  if (PROD_SLUG) {
    const menu = await req({ path: `/api/public/menu/${PROD_SLUG}` });
    smokeCheck('Public menu endpoint returns 200', menu.status === 200, menu.status, 200);
    smokeCheck('Menu response has businessName', menu.body && !!menu.body.businessName);
    smokeCheck('Menu response has categories array',
      menu.body && Array.isArray(menu.body.categories));
    if (menu.body) {
      console.log(`  ℹ️  Business: "${menu.body.businessName}" — ${(menu.body.categories || []).length} categories`);
    }
  } else {
    console.log('  ⏭️  Skipping — set PROD_SLUG env var to test public menu endpoint');
    console.log('  Example: PROD_SLUG=sharma-dhaba-delhi node tests/production_smoke_test.js');
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`  Results: ${smokePassed} PASSED / ${smokeFailed} FAILED`);
  console.log(`  Timestamp: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════════════════════');

  if (smokeFailed > 0) {
    console.log('\n❌ SMOKE TEST FAILED — Production issues detected.\n');
    process.exit(1);
  } else {
    console.log('\n🚀 ALL SMOKE TESTS PASSED — Production deployment is healthy!\n');
  }
}

runSmokeTest().catch(err => {
  console.error('Smoke test crashed:', err.message);
  process.exit(1);
});
