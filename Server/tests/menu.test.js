/**
 * MenuMitra — Menu Route Unit Tests
 * Developed by Abhijit Kumar Misra
 *
 * Tests: POST/GET /api/menu/categories, POST/GET /api/menu/items
 * Uses JWT owner token generated in-process. Prisma is mocked.
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
    category: {
      findMany: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn()
    },
    foodItem: {
      findMany: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn()
    },
    auditLog: { create: jest.fn() },
    order: { count: jest.fn() },
    $queryRaw: jest.fn().mockResolvedValue([1]),
    $transaction: jest.fn()
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

jest.mock('socket.io', () => {
  return jest.fn(() => ({ on: jest.fn(), to: jest.fn(() => ({ emit: jest.fn() })) }));
});

// ── Mock cloudinary to avoid upload calls ───────────────────────────────────
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: { upload_stream: jest.fn() }
  }
}));

const { app } = require('../src/app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ── Generate a valid owner JWT for protected route tests ────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'menumitrasecretjwttokenstring12345678901234567890123456789012';
const ownerPayload = { id: 'owner-uuid-001', email: 'owner@test.com', slug: 'test-cafe-mumbai' };
const ownerToken = jwt.sign(ownerPayload, JWT_SECRET, { expiresIn: '1h' });
const authHeader = `Bearer ${ownerToken}`;

const mockCategory = {
  id: 'cat-uuid-001',
  owner_id: 'owner-uuid-001',
  name: 'Starters',
  sort_order: 1,
  created_at: new Date()
};

const mockFoodItem = {
  id: 'item-uuid-001',
  owner_id: 'owner-uuid-001',
  category_id: 'cat-uuid-001',
  name: 'Paneer Tikka',
  description: 'Grilled paneer',
  price: 250.00,
  is_veg: true,
  is_available: true,
  sort_order: 1,
  photo_url: null,
  created_at: new Date(),
  category: mockCategory
};

// ── Category Tests ───────────────────────────────────────────────────────────
describe('Menu — Category Routes (Protected)', () => {
  beforeEach(() => jest.clearAllMocks());

  test('GET /api/menu/categories — should return owner categories (200)', async () => {
    prisma.category.findMany.mockResolvedValue([mockCategory]);

    const res = await request(app)
      .get('/api/menu/categories')
      .set('Authorization', authHeader);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].name).toBe('Starters');
  });

  test('GET /api/menu/categories — should return 401 without token', async () => {
    const res = await request(app).get('/api/menu/categories');
    expect(res.status).toBe(401);
  });

  test('POST /api/menu/categories — should create a category (201)', async () => {
    prisma.category.create.mockResolvedValue(mockCategory);

    const res = await request(app)
      .post('/api/menu/categories')
      .set('Authorization', authHeader)
      .send({ name: 'Starters', sort_order: 1 });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('category');
    expect(res.body.category.name).toBe('Starters');
  });

  test('POST /api/menu/categories — should return 400 if name missing', async () => {
    const res = await request(app)
      .post('/api/menu/categories')
      .set('Authorization', authHeader)
      .send({ sort_order: 1 });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/required/i);
  });

  test('PUT /api/menu/categories/:id — should update category (200)', async () => {
    prisma.category.updateMany.mockResolvedValue({ count: 1 });

    const res = await request(app)
      .put('/api/menu/categories/cat-uuid-001')
      .set('Authorization', authHeader)
      .send({ name: 'Main Course' });

    expect(res.status).toBe(200);
  });

  test('PUT /api/menu/categories/:id — should return 404 if not found', async () => {
    prisma.category.updateMany.mockResolvedValue({ count: 0 });

    const res = await request(app)
      .put('/api/menu/categories/nonexistent-id')
      .set('Authorization', authHeader)
      .send({ name: 'Nope' });

    expect(res.status).toBe(404);
  });

  test('DELETE /api/menu/categories/:id — should delete category (200)', async () => {
    prisma.category.deleteMany.mockResolvedValue({ count: 1 });

    const res = await request(app)
      .delete('/api/menu/categories/cat-uuid-001')
      .set('Authorization', authHeader);

    expect(res.status).toBe(200);
  });
});

// ── Food Item Tests ──────────────────────────────────────────────────────────
describe('Menu — Food Item Routes (Protected)', () => {
  beforeEach(() => jest.clearAllMocks());

  test('GET /api/menu/items — should return owner food items (200)', async () => {
    prisma.foodItem.findMany.mockResolvedValue([mockFoodItem]);

    const res = await request(app)
      .get('/api/menu/items')
      .set('Authorization', authHeader);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].name).toBe('Paneer Tikka');
  });

  test('POST /api/menu/items — should create a food item (201)', async () => {
    prisma.foodItem.create.mockResolvedValue(mockFoodItem);

    const res = await request(app)
      .post('/api/menu/items')
      .set('Authorization', authHeader)
      .send({
        name: 'Paneer Tikka',
        price: 250,
        category_id: 'cat-uuid-001',
        is_veg: true
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('item');
    expect(res.body.item.name).toBe('Paneer Tikka');
  });

  test('POST /api/menu/items — should return 400 if name missing', async () => {
    const res = await request(app)
      .post('/api/menu/items')
      .set('Authorization', authHeader)
      .send({ price: 100 });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/required/i);
  });

  test('POST /api/menu/items — should return 400 if price missing', async () => {
    const res = await request(app)
      .post('/api/menu/items')
      .set('Authorization', authHeader)
      .send({ name: 'Something' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/required/i);
  });

  test('DELETE /api/menu/items/:id — should delete item (200)', async () => {
    prisma.foodItem.deleteMany.mockResolvedValue({ count: 1 });

    const res = await request(app)
      .delete('/api/menu/items/item-uuid-001')
      .set('Authorization', authHeader);

    expect(res.status).toBe(200);
  });

  test('DELETE /api/menu/items/:id — should return 404 if not found', async () => {
    prisma.foodItem.deleteMany.mockResolvedValue({ count: 0 });

    const res = await request(app)
      .delete('/api/menu/items/nonexistent')
      .set('Authorization', authHeader);

    expect(res.status).toBe(404);
  });
});
