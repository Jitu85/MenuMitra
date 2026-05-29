/**
 * MenuMitra — Orders Route Unit Tests
 * Developed by Abhijit Kumar Misra
 *
 * Tests: POST /api/orders (guest), GET /api/orders (owner), PUT /api/orders/:id/status
 * Prisma is mocked — no live DB required.
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
      count: jest.fn()
    },
    admin: { findUnique: jest.fn(), update: jest.fn() },
    category: { findMany: jest.fn() },
    foodItem: {
      findMany: jest.fn(),
      create: jest.fn()
    },
    order: {
      count: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn()
    },
    auditLog: { create: jest.fn() },
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

// ── Generate valid owner JWT ─────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'menumitrasecretjwttokenstring12345678901234567890123456789012';
const ownerPayload = { id: 'owner-uuid-001', email: 'owner@test.com', slug: 'test-cafe-mumbai' };
const ownerToken = jwt.sign(ownerPayload, JWT_SECRET, { expiresIn: '1h' });
const authHeader = `Bearer ${ownerToken}`;

// ── Mock data ────────────────────────────────────────────────────────────────
const mockOwner = {
  id: 'owner-uuid-001',
  is_active: true,
  subscription_status: 'trial',
  business_name: 'Test Cafe'
};

const mockFoodItem = {
  id: 'item-uuid-001',
  owner_id: 'owner-uuid-001',
  name: 'Paneer Tikka',
  price: 250.00,
  is_available: true
};

const mockOrder = {
  id: 'order-uuid-001',
  owner_id: 'owner-uuid-001',
  order_number: 'ORD-20260529-0001',
  table_number: '05',
  customer_name: 'Test Customer',
  subtotal: 500.00,
  tax_amount: 0,
  total_amount: 500.00,
  payment_method: 'upi_qr',
  payment_status: 'pending',
  notes: null,
  razorpay_order_id: null,
  razorpay_payment_id: null,
  created_at: new Date(),
  items: [
    {
      id: 'oi-uuid-001',
      food_item_id: 'item-uuid-001',
      item_name: 'Paneer Tikka',
      quantity: 2,
      unit_price: 250.00,
      total_price: 500.00
    }
  ]
};

// ── Test Suite: Guest Order Placement ────────────────────────────────────────
describe('POST /api/orders — Guest Order Placement (Public)', () => {
  beforeEach(() => jest.clearAllMocks());

  test('should place order successfully (201)', async () => {
    prisma.owner.findUnique.mockResolvedValue(mockOwner);
    prisma.order.count.mockResolvedValue(0);
    prisma.foodItem.findMany.mockResolvedValue([mockFoodItem]);
    prisma.order.create.mockResolvedValue(mockOrder);

    const res = await request(app)
      .post('/api/orders')
      .send({
        owner_id: 'owner-uuid-001',
        table_number: '05',
        customer_name: 'Test Customer',
        items: [{ food_item_id: 'item-uuid-001', quantity: 2 }]
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('order');
    expect(res.body.order.orderNumber).toBe('ORD-20260529-0001');
    expect(res.body.order.totalAmount).toBe(500.00);
  });

  test('should return 400 if owner_id is missing', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        table_number: '05',
        items: [{ food_item_id: 'item-uuid-001', quantity: 1 }]
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Missing required/i);
  });

  test('should return 400 if items array is empty', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        owner_id: 'owner-uuid-001',
        table_number: '05',
        items: []
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Missing required/i);
  });

  test('should return 400 for inactive owner', async () => {
    prisma.owner.findUnique.mockResolvedValue({ ...mockOwner, is_active: false });

    const res = await request(app)
      .post('/api/orders')
      .send({
        owner_id: 'owner-uuid-001',
        table_number: '05',
        items: [{ food_item_id: 'item-uuid-001', quantity: 1 }]
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/not currently accepting/i);
  });

  test('should return 403 for expired subscription', async () => {
    prisma.owner.findUnique.mockResolvedValue({ ...mockOwner, subscription_status: 'expired' });

    const res = await request(app)
      .post('/api/orders')
      .send({
        owner_id: 'owner-uuid-001',
        table_number: '05',
        items: [{ food_item_id: 'item-uuid-001', quantity: 1 }]
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/suspended/i);
  });

  test('should return 404 if food item not found in menu', async () => {
    prisma.owner.findUnique.mockResolvedValue(mockOwner);
    prisma.order.count.mockResolvedValue(0);
    prisma.foodItem.findMany.mockResolvedValue([]); // Item not found

    const res = await request(app)
      .post('/api/orders')
      .send({
        owner_id: 'owner-uuid-001',
        table_number: '05',
        items: [{ food_item_id: 'nonexistent-item', quantity: 1 }]
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/not found/i);
  });
});

// ── Test Suite: Owner Fetches Orders (Protected) ────────────────────────────
describe('GET /api/orders — Owner Fetches Orders (Protected)', () => {
  beforeEach(() => jest.clearAllMocks());

  test('should return owner orders list (200)', async () => {
    prisma.order.findMany.mockResolvedValue([mockOrder]);

    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', authHeader);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].orderNumber).toBe('ORD-20260529-0001');
  });

  test('should return 401 without token', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.status).toBe(401);
  });
});

// ── Test Suite: Update Order Payment Status ─────────────────────────────────
describe('PUT /api/orders/:id/status — Update Payment Status (Protected)', () => {
  beforeEach(() => jest.clearAllMocks());

  test('should update order status to paid (200)', async () => {
    prisma.order.updateMany.mockResolvedValue({ count: 1 });

    const res = await request(app)
      .put('/api/orders/order-uuid-001/status')
      .set('Authorization', authHeader)
      .send({ paymentStatus: 'paid' });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/paid/i);
  });

  test('should return 404 if order not found or belongs to different owner', async () => {
    prisma.order.updateMany.mockResolvedValue({ count: 0 });

    const res = await request(app)
      .put('/api/orders/nonexistent-order/status')
      .set('Authorization', authHeader)
      .send({ paymentStatus: 'paid' });

    expect(res.status).toBe(404);
  });

  test('should return 400 if paymentStatus is missing', async () => {
    const res = await request(app)
      .put('/api/orders/order-uuid-001/status')
      .set('Authorization', authHeader)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/required/i);
  });

  test('should return 401 without token', async () => {
    const res = await request(app)
      .put('/api/orders/order-uuid-001/status')
      .send({ paymentStatus: 'paid' });

    expect(res.status).toBe(401);
  });
});
