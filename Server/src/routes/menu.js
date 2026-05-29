const express = require('express');
const router = express.Router();
const { authenticateToken, requireOwner } = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const stream = require('stream');

// Configure multer for memory storage and 1MB size limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1 * 1024 * 1024 } // 1MB limit
});
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
    res.json(categories.map(c => ({
      ...c,
      name: c.name_en || c.name
    })));
  } catch (err) {
    next(err);
  }
});

// Create Category
router.post('/categories', async (req, res, next) => {
  const prisma = req.app.get('prisma');
  try {
    const { name, sort_order } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Category name is required.' });
    }

    const category = await prisma.category.create({
      data: {
        owner_id: req.user.id,
        name_en: name,
        name_hi: name,
        sort_order: sort_order ? parseInt(sort_order, 10) : 0
      }
    });

    res.status(201).json({ message: 'Category created successfully!', category: { ...category, name: category.name_en || category.name } });
  } catch (err) {
    next(err);
  }
});

// Update Category
router.put('/categories/:id', async (req, res, next) => {
  const prisma = req.app.get('prisma');
  try {
    const { id } = req.params;
    const { name, sort_order } = req.body;

    const dataToUpdate = {};
    if (name !== undefined) {
      dataToUpdate.name_en = name;
      dataToUpdate.name_hi = name;
    }
    if (sort_order !== undefined) {
      dataToUpdate.sort_order = sort_order ? parseInt(sort_order, 10) : undefined;
    }

    const updated = await prisma.category.updateMany({
      where: { id, owner_id: req.user.id },
      data: dataToUpdate
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
// FOOD ITEM PHOTO UPLOAD
// ─────────────────────────────────────────────────────────────────────────────

router.post('/items/upload', upload.single('photo'), (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No photo uploaded. Please select a valid image under 1MB.' });
  }

  const uploadStream = cloudinary.uploader.upload_stream(
    {
      folder: 'menumitra/food_items',
      width: 500,
      height: 500,
      crop: 'fill',
      gravity: 'center',
      format: 'webp',
      quality: 'auto'
    },
    (error, result) => {
      if (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(500).json({ message: 'Failed to upload photo to cloud storage.' });
      }
      res.json({ url: result.secure_url });
    }
  );

  const bufferStream = new stream.PassThrough();
  bufferStream.end(req.file.buffer);
  bufferStream.pipe(uploadStream);
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
    res.json(items.map(item => ({
      ...item,
      name: item.name_en || item.name,
      description: item.description_en || item.description,
      category: item.category ? { ...item.category, name: item.category.name_en || item.category.name } : null
    })));
  } catch (err) {
    next(err);
  }
});

// Create Food Item
router.post('/items', async (req, res, next) => {
  const prisma = req.app.get('prisma');
  try {
    const {
      name,
      category_id,
      description,
      price,
      photo_url,
      is_veg,
      is_available,
      sort_order
    } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Item name and price are required.' });
    }

    const item = await prisma.foodItem.create({
      data: {
        owner_id: req.user.id,
        category_id: category_id || null,
        name_en: name,
        name_hi: name,
        description_en: description || null,
        description_hi: description || null,
        price: parseFloat(price),
        photo_url: photo_url || null,
        is_veg: is_veg === undefined ? true : is_veg,
        is_available: is_available === undefined ? true : is_available,
        sort_order: sort_order ? parseInt(sort_order, 10) : 0
      }
    });

    res.status(201).json({ message: 'Food item created successfully!', item: { ...item, name: item.name_en || item.name, description: item.description_en || item.description } });
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
      name,
      category_id,
      description,
      price,
      photo_url,
      is_veg,
      is_available,
      sort_order
    } = req.body;

    const dataToUpdate = {};
    if (name !== undefined) {
      dataToUpdate.name_en = name;
      dataToUpdate.name_hi = name;
    }
    if (category_id !== undefined) dataToUpdate.category_id = category_id || null;
    if (description !== undefined) {
      dataToUpdate.description_en = description || null;
      dataToUpdate.description_hi = description || null;
    }
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
