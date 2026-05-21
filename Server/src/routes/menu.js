const express = require('express');
const router = express.Router();
const { authenticateToken, requireOwner } = require('../middleware/auth');

// Apply auth middlewares
router.use(authenticateToken);
router.use(requireOwner);

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY CRUD
// ─────────────────────────────────────────────────────────────────────────────

// Get all categories for owner
router.get('/categories', async (req, res, next) => {
  const prisma = req.app.get('prisma');
  try {
    const categories = await prisma.category.findMany({
      where: { owner_id: req.user.id },
      orderBy: { sort_order: 'asc' }
    });
    res.json(categories);
  } catch (err) {
    next(err);
  }
});

// Create Category
router.post('/categories', async (req, res, next) => {
  const prisma = req.app.get('prisma');
  try {
    const { name_en, name_hi, sort_order } = req.body;
    
    if (!name_en || !name_hi) {
      return res.status(400).json({ message: 'Category names in both English and Hindi are required.' });
    }

    const category = await prisma.category.create({
      data: {
        owner_id: req.user.id,
        name_en,
        name_hi,
        sort_order: sort_order ? parseInt(sort_order, 10) : 0
      }
    });

    res.status(201).json({ message: 'Category created successfully!', category });
  } catch (err) {
    next(err);
  }
});

// Update Category
router.put('/categories/:id', async (req, res, next) => {
  const prisma = req.app.get('prisma');
  try {
    const { id } = req.params;
    const { name_en, name_hi, sort_order } = req.body;

    const updated = await prisma.category.updateMany({
      where: { id, owner_id: req.user.id },
      data: {
        name_en,
        name_hi,
        sort_order: sort_order ? parseInt(sort_order, 10) : undefined
      }
    });

    if (updated.count === 0) {
      return res.status(404).json({ message: 'Category not found or unauthorized.' });
    }

    res.json({ message: 'Category updated successfully!' });
  } catch (err) {
    next(err);
  }
});

// Delete Category
router.delete('/categories/:id', async (req, res, next) => {
  const prisma = req.app.get('prisma');
  try {
    const { id } = req.params;

    const deleted = await prisma.category.deleteMany({
      where: { id, owner_id: req.user.id }
    });

    if (deleted.count === 0) {
      return res.status(404).json({ message: 'Category not found or unauthorized.' });
    }

    res.json({ message: 'Category deleted successfully! Food items in this category have been set to Uncategorized.' });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// FOOD ITEM CRUD
// ─────────────────────────────────────────────────────────────────────────────

// Get all food items for owner
router.get('/items', async (req, res, next) => {
  const prisma = req.app.get('prisma');
  try {
    const items = await prisma.foodItem.findMany({
      where: { owner_id: req.user.id },
      include: { category: true },
      orderBy: { sort_order: 'asc' }
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
});

// Create Food Item
router.post('/items', async (req, res, next) => {
  const prisma = req.app.get('prisma');
  try {
    const {
      name_en,
      name_hi,
      category_id,
      description_en,
      description_hi,
      price,
      photo_url,
      is_veg,
      is_available,
      sort_order
    } = req.body;

    if (!name_en || !name_hi || price === undefined) {
      return res.status(400).json({ message: 'Item name (EN/HI) and price are required.' });
    }

    const item = await prisma.foodItem.create({
      data: {
        owner_id: req.user.id,
        category_id: category_id || null,
        name_en,
        name_hi,
        description_en: description_en || null,
        description_hi: description_hi || null,
        price: parseFloat(price),
        photo_url: photo_url || null,
        is_veg: is_veg === undefined ? true : is_veg,
        is_available: is_available === undefined ? true : is_available,
        sort_order: sort_order ? parseInt(sort_order, 10) : 0
      }
    });

    res.status(201).json({ message: 'Food item created successfully!', item });
  } catch (err) {
    next(err);
  }
});

// Update Food Item
router.put('/items/:id', async (req, res, next) => {
  const prisma = req.app.get('prisma');
  try {
    const { id } = req.params;
    const {
      name_en,
      name_hi,
      category_id,
      description_en,
      description_hi,
      price,
      photo_url,
      is_veg,
      is_available,
      sort_order
    } = req.body;

    const dataToUpdate = {};
    if (name_en !== undefined) dataToUpdate.name_en = name_en;
    if (name_hi !== undefined) dataToUpdate.name_hi = name_hi;
    if (category_id !== undefined) dataToUpdate.category_id = category_id || null;
    if (description_en !== undefined) dataToUpdate.description_en = description_en || null;
    if (description_hi !== undefined) dataToUpdate.description_hi = description_hi || null;
    if (price !== undefined) dataToUpdate.price = parseFloat(price);
    if (photo_url !== undefined) dataToUpdate.photo_url = photo_url || null;
    if (is_veg !== undefined) dataToUpdate.is_veg = is_veg;
    if (is_available !== undefined) dataToUpdate.is_available = is_available;
    if (sort_order !== undefined) dataToUpdate.sort_order = parseInt(sort_order, 10);

    const updated = await prisma.foodItem.updateMany({
      where: { id, owner_id: req.user.id },
      data: dataToUpdate
    });

    if (updated.count === 0) {
      return res.status(404).json({ message: 'Food item not found or unauthorized.' });
    }

    res.json({ message: 'Food item updated successfully!' });
  } catch (err) {
    next(err);
  }
});

// Delete Food Item
router.delete('/items/:id', async (req, res, next) => {
  const prisma = req.app.get('prisma');
  try {
    const { id } = req.params;

    const deleted = await prisma.foodItem.deleteMany({
      where: { id, owner_id: req.user.id }
    });

    if (deleted.count === 0) {
      return res.status(404).json({ message: 'Food item not found or unauthorized.' });
    }

    res.json({ message: 'Food item deleted successfully!' });
  } catch (err) {
    next(err);
  }
});

// Bulk Toggle Availability (e.g. for holidays or closing down)
router.post('/items/bulk-toggle', async (req, res, next) => {
  const prisma = req.app.get('prisma');
  try {
    const { isAvailable } = req.body;

    if (isAvailable === undefined) {
      return res.status(400).json({ message: 'isAvailable parameter is required.' });
    }

    await prisma.foodItem.updateMany({
      where: { owner_id: req.user.id },
      data: { is_available: !!isAvailable }
    });

    res.json({ message: `Successfully updated all menu items to ${isAvailable ? 'available' : 'unavailable'}.` });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
