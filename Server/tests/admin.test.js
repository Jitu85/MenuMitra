/**
 * MenuMitra — Admin Route Unit Tests
 * Developed by Abhijit Kumar Misra
 *
 * Tests: GET /api/admin/stats, GET /api/admin/owners, PUT /api/admin/owners/:id/status
 * Admin JWT is generated in-process. Prisma is mocked.
 */

const request = require('supertest');
const jwt = require('jsonwebtoken');

// ── Mock Prisma client ──────────────────────────────────────────────────────
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    owner: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn()
    },
    admin: { findUnique: jest.fn(), update: jest.fn() },
    category: { findMany: jest.fn() },
    foodItem: { findMany: jest.fn() },
    order: { count: jest.fn(), findMany: jest.fn() },
    subscription: {
      aggregate: jest.fn()
    },
    auditLog: { create: jest.fn(), findMany: jest.fn() },
    $queryRaw: jest.fn().mockResolvedValue([1]),
    $transaction: jest.fn()
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

jest.mock('socket.io', () => {
  return jest.fn(() => ({
    on: jest.fn(),
    to: jest.fn(() => ({ emit: jest.fn() }))
  }));
});

jest.mock('cloudinary', () => ({
  v2: { config: jest.fn(), uploader: { upload_stream: jest.fn() } }
}));

const { app } = require('../src/app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ── Generate valid admin JWT ─────────────────────────────────────────────────
const JWT_ADMIN_SECRET = process.env.JWT_ADMIN_SECRET || 'menumitraadminsecretjwttokenstring12345678901234567890123456789012';
const adminPayload = { id: 'admin-uuid-001', login_id: 'Jitu', email: 'abhijit.jituwreath@gmail.com', role: 'admin' };
const adminToken = jwt.sign(adminPayload, JWT_ADMIN_SECRET, { expiresIn: '1h' });
const adminAuthHeader = `Bearer ${adminToken}`;

// ── Generate valid owner JWT to test unauthorized access ─────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'menumitrasecretjwttokenstring12345678901234567890123456789012';
const ownerPayload = { id: 'owner-uuid-001', email: 'owner@test.com', slug: 'test-cafe-mumbai' };
const ownerToken = jwt.sign(ownerPayload, JWT_SECRET, { expiresIn: '1h' });
const ownerAuthHeader = `Bearer ${ownerToken}`;

// ── Mock data ────────────────────────────────────────────────────────────────
const mockOwners = [
  {
    id: 'owner-uuid-001',
    business_name: 'Test Cafe',
    business_type: 'cafe',
    owner_name: 'Test Owner',
    email: 'test@menumitra.com',
    phone: '9876543210',
    city: 'Mumbai',
    state: 'Maharashtra',
    is_active: true,
    subscription_status: 'trial',
    subscription_expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    created_at: new Date()
  }
];

// ── Test Suite: Admin Platform Stats ────────────────────────────────────────
describe('GET /api/admin/stats — Platform Statistics (Admin Protected)', () => {
  beforeEach(() => jest.clearAllMocks());

  test('should return platform stats for admin (200)', async () => {
    prisma.owner.count.mockResolvedValue(42);
    prisma.subscription.aggregate.mockResolvedValue({ _sum: { amount_paid: 4200 } });
    prisma.order.count.mockResolvedValue(157);

    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', adminAuthHeader);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalOwners');
    expect(res.body).toHaveProperty('totalOrders');
    expect(res.body).toHaveProperty('platformRevenue');
    expect(typeof res.body.totalOwners).toBe('number');
  });

  test('should return 401 with no token', async () => {
    const res = await request(app).get('/api/admin/stats');
    expect(res.status).toBe(401);
  });

  test('should return 403 if called with owner token (not admin)', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', ownerAuthHeader);

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/Super Admin role required/i);
  });
});

// ── Test Suite: Owner Management ─────────────────────────────────────────────
describe('GET /api/admin/owners — Owner List (Admin Protected)', () => {
  beforeEach(() => jest.clearAllMocks());

  test('should return list of all owners (200)', async () => {
    prisma.owner.findMany.mockResolvedValue(mockOwners);

    const res = await request(app)
      .get('/api/admin/owners')
      .set('Authorization', adminAuthHeader);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].businessName).toBe('Test Cafe');
    expect(res.body[0].email).toBe('test@menumitra.com');
  });

  test('should return empty array when no owners', async () => {
    prisma.owner.findMany.mockResolvedValue([]);

    const res = await request(app)
      .get('/api/admin/owners')
      .set('Authorization', adminAuthHeader);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });

  test('should return 401 with no auth header', async () => {
    const res = await request(app).get('/api/admin/owners');
    expect(res.status).toBe(401);
  });

  test('should return 403 with owner (non-admin) token', async () => {
    const res = await request(app)
      .get('/api/admin/owners')
      .set('Authorization', ownerAuthHeader);

    expect(res.status).toBe(403);
  });
});

// ── Test Suite: Activate / Deactivate Owner ──────────────────────────────────
describe('PUT /api/admin/owners/:id/status — Toggle Owner Status (Admin Protected)', () => {
  beforeEach(() => jest.clearAllMocks());

  test('should deactivate an owner (200)', async () => {
    prisma.owner.update.mockResolvedValue({ ...mockOwners[0], is_active: false });
    prisma.auditLog.create.mockResolvedValue({});

    const res = await request(app)
      .put('/api/admin/owners/owner-uuid-001/status')
      .set('Authorization', adminAuthHeader)
      .send({ isActive: false });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/Suspended/i);
  });

  test('should activate an owner (200)', async () => {
    prisma.owner.update.mockResolvedValue({ ...mockOwners[0], is_active: true });
    prisma.auditLog.create.mockResolvedValue({});

    const res = await request(app)
      .put('/api/admin/owners/owner-uuid-001/status')
      .set('Authorization', adminAuthHeader)
      .send({ isActive: true });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/Active/i);
  });

  test('should return 400 if isActive field missing', async () => {
    const res = await request(app)
      .put('/api/admin/owners/owner-uuid-001/status')
      .set('Authorization', adminAuthHeader)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/required/i);
  });

  test('should return 401 with no token', async () => {
    const res = await request(app)
      .put('/api/admin/owners/owner-uuid-001/status')
      .send({ isActive: false });

    expect(res.status).toBe(401);
  });
});

// ── Test Suite: Audit Logs ────────────────────────────────────────────────────
describe('GET /api/admin/audit — Audit Logs (Admin Protected)', () => {
  beforeEach(() => jest.clearAllMocks());

  test('should return audit logs for admin (200)', async () => {
    prisma.auditLog.findMany.mockResolvedValue([
      {
        id: 'log-001',
        actor_id: 'admin-uuid-001',
        actor_role: 'admin',
        action: 'ACTIVATE_ACCOUNT',
        target_type: 'owner',
        target_id: 'owner-uuid-001',
        details: '{}',
        created_at: new Date()
      }
    ]);

    const res = await request(app)
      .get('/api/admin/audit')
      .set('Authorization', adminAuthHeader);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].action).toBe('ACTIVATE_ACCOUNT');
  });

  test('should return 403 if owner tries to access audit logs', async () => {
    const res = await request(app)
      .get('/api/admin/audit')
      .set('Authorization', ownerAuthHeader);

    expect(res.status).toBe(403);
  });
});
