/**
 * MenuMitra — Auth Route Unit Tests
 * Developed by Abhijit Kumar Misra
 *
 * Tests: POST /api/auth/signup, /api/auth/login, /api/auth/admin/login
 * Prisma is mocked — no live DB required.
 */

const request = require('supertest');
const bcrypt = require('bcryptjs');

// ── Mock Prisma client ──────────────────────────────────────────────────────
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    owner: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn()
    },
    admin: {
      findUnique: jest.fn(),
      update: jest.fn()
    },
    auditLog: {
      create: jest.fn()
    },
    passwordResetToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn()
    },
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    $transaction: jest.fn()
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

// ── Mock Socket.io (not needed for auth tests) ─────────────────────────────
jest.mock('socket.io', () => {
  const mockIo = { on: jest.fn(), to: jest.fn(() => ({ emit: jest.fn() })) };
  return jest.fn(() => mockIo);
});

// ── Import app after mocks ──────────────────────────────────────────────────
const { app } = require('../src/app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ── Helpers ─────────────────────────────────────────────────────────────────
const validSignup = {
  business_name: 'Test Cafe',
  business_type: 'cafe',
  owner_name: 'Test Owner',
  email: 'test@menumitra.com',
  phone: '9876543210',
  address: '123 Test St',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400001',
  table_count: 10,
  password: 'SecurePass123'
};

const mockOwnerRecord = {
  id: 'owner-uuid-001',
  business_name: 'Test Cafe',
  business_type: 'cafe',
  owner_name: 'Test Owner',
  email: 'test@menumitra.com',
  phone: '9876543210',
  address: '123 Test St',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400001',
  table_count: 10,
  unique_slug: 'test-cafe-mumbai',
  subscription_status: 'trial',
  subscription_expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  payment_method_pref: 'both',
  is_active: true,
  password_hash: bcrypt.hashSync('SecurePass123', 10),
  created_at: new Date(),
  updated_at: new Date()
};

// ── Test Suite: Owner Registration ──────────────────────────────────────────
describe('POST /api/auth/signup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should register a new owner successfully (201)', async () => {
    prisma.owner.findUnique.mockResolvedValue(null); // No existing owner
    prisma.owner.create.mockResolvedValue(mockOwnerRecord);
    prisma.auditLog.create.mockResolvedValue({});

    const res = await request(app)
      .post('/api/auth/signup')
      .send(validSignup);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('owner');
    expect(res.body.owner.email).toBe(validSignup.email);
  });

  test('should return 400 if required fields are missing', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'incomplete@test.com' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Missing required/i);
  });

  test('should return 400 if email already registered', async () => {
    prisma.owner.findUnique.mockResolvedValueOnce(mockOwnerRecord); // email match

    const res = await request(app)
      .post('/api/auth/signup')
      .send(validSignup);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already registered/i);
  });

  test('should return 400 if phone already registered', async () => {
    prisma.owner.findUnique
      .mockResolvedValueOnce(null)           // email check — clear
      .mockResolvedValueOnce(mockOwnerRecord); // phone check — taken

    const res = await request(app)
      .post('/api/auth/signup')
      .send(validSignup);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already registered/i);
  });
});

// ── Test Suite: Owner Login ──────────────────────────────────────────────────
describe('POST /api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should login successfully with valid credentials (200)', async () => {
    prisma.owner.findUnique.mockResolvedValue(mockOwnerRecord);
    prisma.owner.update.mockResolvedValue(mockOwnerRecord);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@menumitra.com', password: 'SecurePass123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.role).toBe('owner');
  });

  test('should return 401 for wrong password', async () => {
    prisma.owner.findUnique.mockResolvedValue(mockOwnerRecord);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@menumitra.com', password: 'WrongPassword!' });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/Invalid/i);
  });

  test('should return 401 for non-existent email', async () => {
    prisma.owner.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@fake.com', password: 'somepass' });

    expect(res.status).toBe(401);
  });

  test('should return 403 for deactivated account', async () => {
    prisma.owner.findUnique.mockResolvedValue({ ...mockOwnerRecord, is_active: false });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@menumitra.com', password: 'SecurePass123' });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/deactivated/i);
  });
});

// ── Test Suite: Admin Login ──────────────────────────────────────────────────
describe('POST /api/auth/admin/login', () => {
  const mockAdmin = {
    id: 'admin-uuid-001',
    name: 'Abhijit Kumar Misra',
    login_id: 'Jitu',
    email: 'abhijit.jituwreath@gmail.com',
    password_hash: bcrypt.hashSync('admin123', 10),
    last_login: null
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should login admin with correct credentials (200)', async () => {
    prisma.admin.findUnique.mockResolvedValue(mockAdmin);
    prisma.admin.update.mockResolvedValue(mockAdmin);

    const res = await request(app)
      .post('/api/auth/admin/login')
      .send({ loginId: 'Jitu', password: 'admin123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.role).toBe('admin');
  });

  test('should return 401 for wrong admin password', async () => {
    prisma.admin.findUnique.mockResolvedValue(mockAdmin);

    const res = await request(app)
      .post('/api/auth/admin/login')
      .send({ loginId: 'Jitu', password: 'wrong' });

    expect(res.status).toBe(401);
  });

  test('should return 401 for non-existent admin login ID', async () => {
    prisma.admin.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/admin/login')
      .send({ loginId: 'FakeAdmin', password: 'admin123' });

    expect(res.status).toBe(401);
  });

  test('should return 400 if loginId is missing', async () => {
    const res = await request(app)
      .post('/api/auth/admin/login')
      .send({ password: 'admin123' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/required/i);
  });
});

// ── Test Suite: Health Check ─────────────────────────────────────────────────
describe('GET /api/health', () => {
  test('should return 200 with status ok', async () => {
    prisma.$queryRaw.mockResolvedValue([1]);

    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
