/**
 * MenuMitra — Load Test
 * Developed by Abhijit Kumar Misra
 *
 * Simulates 50 concurrent requests to the public menu endpoint.
 * Measures average response time, p95, and max time.
 * Run with: node tests/load_test.js
 *
 * Requires a live local server on port 4000 OR set BASE_URL env var.
 */

const http = require('http');
const https = require('https');

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';
const SLUG = process.env.TEST_SLUG || 'test-slug'; // Replace with a real slug from your DB
const CONCURRENT_USERS = 50;
const TARGET_PATH = `/api/public/menu/${SLUG}`;

const PASS_THRESHOLDS = {
  avgMs: 800,      // Avg response must be under 800ms
  p95Ms: 1500,     // 95th percentile under 1500ms
  errorRate: 0.1   // Less than 10% errors
};

// ── HTTP request helper ──────────────────────────────────────────────────────
function makeRequest(url) {
  return new Promise((resolve) => {
    const start = Date.now();
    const protocol = url.startsWith('https') ? https : http;

    const req = protocol.get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          duration: Date.now() - start,
          error: null
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        status: 0,
        duration: Date.now() - start,
        error: err.message
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        status: 0,
        duration: 10000,
        error: 'Request timeout (10s)'
      });
    });
  });
}

// ── Statistics helpers ────────────────────────────────────────────────────────
function percentile(sortedArr, p) {
  const idx = Math.ceil((p / 100) * sortedArr.length) - 1;
  return sortedArr[Math.max(0, idx)];
}

function formatMs(ms) {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`;
}

// ── Main Load Test ───────────────────────────────────────────────────────────
async function runLoadTest() {
  const url = `${BASE_URL}${TARGET_PATH}`;

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('             MENUMITRA LOAD TEST — Developed by Abhijit Kumar Misra');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`Target URL   : ${url}`);
  console.log(`Concurrent   : ${CONCURRENT_USERS} simultaneous requests`);
  console.log(`Thresholds   : avg < ${formatMs(PASS_THRESHOLDS.avgMs)}, p95 < ${formatMs(PASS_THRESHOLDS.p95Ms)}, errors < ${PASS_THRESHOLDS.errorRate * 100}%`);
  console.log('───────────────────────────────────────────────────────────────');
  console.log('Firing requests...\n');

  const startAll = Date.now();

  // Fire all requests concurrently
  const results = await Promise.all(
    Array.from({ length: CONCURRENT_USERS }, () => makeRequest(url))
  );

  const totalMs = Date.now() - startAll;

  // Analyse results
  const durations = results.map(r => r.duration).sort((a, b) => a - b);
  const errors = results.filter(r => r.error || r.status === 0 || r.status >= 500);
  const successes = results.filter(r => r.status === 200 || r.status === 404); // 404 = valid slug not found, still server responded

  const avgMs = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
  const minMs = durations[0];
  const maxMs = durations[durations.length - 1];
  const p50Ms = percentile(durations, 50);
  const p95Ms = percentile(durations, 95);
  const p99Ms = percentile(durations, 99);
  const errorRate = errors.length / CONCURRENT_USERS;

  // Print result summary
  console.log(`Total wall time  : ${formatMs(totalMs)}`);
  console.log(`Requests sent    : ${CONCURRENT_USERS}`);
  console.log(`✅ Successes     : ${successes.length}`);
  console.log(`❌ Errors        : ${errors.length}`);
  if (errors.length > 0) {
    const errSample = errors.slice(0, 3).map(e => `  HTTP ${e.status} — ${e.error || 'server error'}`);
    errSample.forEach(e => console.log(e));
  }
  console.log('');
  console.log('── Response Time Distribution ──────────────────────────────────');
  console.log(`  Min   : ${formatMs(minMs)}`);
  console.log(`  Avg   : ${formatMs(avgMs)}`);
  console.log(`  p50   : ${formatMs(p50Ms)}`);
  console.log(`  p95   : ${formatMs(p95Ms)}`);
  console.log(`  p99   : ${formatMs(p99Ms)}`);
  console.log(`  Max   : ${formatMs(maxMs)}`);
  console.log('');

  // Pass/Fail evaluation
  const checks = [
    { name: `Avg response < ${formatMs(PASS_THRESHOLDS.avgMs)}`, pass: avgMs <= PASS_THRESHOLDS.avgMs },
    { name: `p95 response < ${formatMs(PASS_THRESHOLDS.p95Ms)}`, pass: p95Ms <= PASS_THRESHOLDS.p95Ms },
    { name: `Error rate < ${PASS_THRESHOLDS.errorRate * 100}%`, pass: errorRate <= PASS_THRESHOLDS.errorRate }
  ];

  console.log('── Results ─────────────────────────────────────────────────────');
  let allPassed = true;
  for (const c of checks) {
    const icon = c.pass ? '✅' : '❌';
    console.log(`  ${icon} ${c.name}`);
    if (!c.pass) allPassed = false;
  }

  console.log('');
  if (allPassed) {
    console.log('🎉 LOAD TEST PASSED — MenuMitra handles concurrent traffic well!');
  } else {
    console.log('⚠️  LOAD TEST FAILED — Some thresholds were exceeded. Check server performance.');
    process.exit(1);
  }
  console.log('═══════════════════════════════════════════════════════════════');
}

runLoadTest().catch(err => {
  console.error('Load test crashed:', err.message);
  process.exit(1);
});
