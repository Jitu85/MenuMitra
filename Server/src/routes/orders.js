const express = require('express');
const router = express.Router();
const { authenticateToken, requireOwner } = require('../middleware/auth');

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOMER ORDER PLACEMENT (PUBLIC — GUEST CHECKOUT)
// ─────────────────────────────────────────────────────────────────────────────

router.post('/', async (req, res, next) => {
  const prisma = req.app.get('prisma');
  const io = req.app.get('io');

  try {
    const {
      owner_id,
      table_number,
      customer_name,
      payment_method,
      items, // Array of { food_item_id, quantity }
      notes,
      language_used
    } = req.body;

    if (!owner_id || !table_number || !items || items.length === 0) {
      return res.status(400).json({ message: 'Missing required checkout information: owner, table, or items.' });
    }

    // Verify owner exists and is active
    const owner = await prisma.owner.findUnique({
      where: { id: owner_id }
    });

    if (!owner || !owner.is_active) {
      return res.status(400).json({ message: 'Restaurant is not currently accepting orders.' });
    }

    // Verify subscription status is not expired
    if (owner.subscription_status === 'expired') {
      return res.status(403).json({ message: 'This digital menu is temporarily suspended.' });
    }

    // Calculate sequential order number per owner for today
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayCount = await prisma.order.count({
      where: {
        owner_id,
        created_at: { gte: startOfToday }
      }
    });

    const sequentialStr = String(todayCount + 1).padStart(4, '0');
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const orderNumber = `ORD-${dateStr}-${sequentialStr}`;

    // Get food item details to compute pricing and capture snapshots
    const foodItemIds = items.map(i => i.food_item_id);
    const dbFoodItems = await prisma.foodItem.findMany({
      where: { id: { in: foodItemIds }, owner_id }
    });

    // Match and calculate totals
    let subtotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const dbItem = dbFoodItems.find(f => f.id === item.food_item_id);
      if (!dbItem) {
        return res.status(404).json({ message: `Food item not found in menu: ${item.food_item_id}` });
      }
      if (!dbItem.is_available) {
        return res.status(400).json({ message: `Food item is sold out: ${dbItem.name_en}` });
      }

      const totalItemPrice = dbItem.price * parseInt(item.quantity, 10);
      subtotal += totalItemPrice;

      orderItemsData.push({
        food_item_id: dbItem.id,
        item_name_en: dbItem.name_en,
        item_name_hi: dbItem.name_hi,
        quantity: parseInt(item.quantity, 10),
        unit_price: dbItem.price,
        total_price: totalItemPrice
      });
    }

    const taxAmount = 0; // standard zero extra tax unless owner configures
    const totalAmount = subtotal + taxAmount;

    // Create order inside transactional wrapper
    const newOrder = await prisma.order.create({
      data: {
        owner_id,
        order_number: orderNumber,
        table_number: table_number.toString(),
        customer_name: customer_name || 'Guest',
        subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        payment_method,
        payment_status: 'pending', // Awaiting payment
        notes: notes || null,
        language_used: language_used || 'en',
        items: {
          create: orderItemsData
        }
      },
      include: {
        items: true
      }
    });

    // Notify Business Owner in Real-Time
    io.to(owner_id).emit('new_order_received', {
      id: newOrder.id,
      orderNumber: newOrder.order_number,
      tableNumber: newOrder.table_number,
      customerName: newOrder.customer_name,
      totalAmount: newOrder.total_amount,
      createdAt: newOrder.created_at,
      paymentMethod: newOrder.payment_method,
      items: newOrder.items.map(i => ({
        nameEn: i.item_name_en,
        qty: i.quantity,
        price: i.unit_price
      }))
    });

    res.status(201).json({
      message: 'Order placed successfully! Awaiting payment confirmation.',
      order: {
        id: newOrder.id,
        orderNumber: newOrder.order_number,
        totalAmount: newOrder.total_amount,
        paymentMethod: newOrder.payment_method,
        paymentStatus: newOrder.payment_status
      }
    });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PROTECTED MERCHANT ROUTES (JWT Auth & Business Owner role required)
// ─────────────────────────────────────────────────────────────────────────────

router.use(authenticateToken);
router.use(requireOwner);

// Get All Orders for Owner with optional filters (table, payment status)
router.get('/', async (req, res, next) => {
  const prisma = req.app.get('prisma');
  try {
    const ownerId = req.user.id;
    const { table, paymentStatus } = req.query;

    const filter = { owner_id: ownerId };
    if (table) {
      filter.table_number = table.toString();
    }
    if (paymentStatus) {
      filter.payment_status = paymentStatus;
    }

    const orders = await prisma.order.findMany({
      where: filter,
      include: {
        items: true
      },
      orderBy: { created_at: 'desc' }
    });

    res.json(orders.map(o => ({
      id: o.id,
      orderNumber: o.order_number,
      tableNumber: o.table_number,
      customerName: o.customer_name || 'Guest',
      subtotal: o.subtotal,
      taxAmount: o.tax_amount,
      totalAmount: o.total_amount,
      paymentMethod: o.payment_method,
      paymentStatus: o.payment_status,
      razorpayOrderId: o.razorpay_order_id,
      razorpayPaymentId: o.razorpay_payment_id,
      notes: o.notes,
      createdAt: o.created_at,
      items: o.items.map(i => ({
        id: i.id,
        foodItemId: i.food_item_id,
        nameEn: i.item_name_en,
        nameHi: i.item_name_hi,
        qty: i.quantity,
        price: i.unit_price,
        totalPrice: i.total_price
      }))
    })));
  } catch (err) {
    next(err);
  }
});

// Update Order Payment Status
router.put('/:id/status', async (req, res, next) => {
  const prisma = req.app.get('prisma');
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    if (!paymentStatus) {
      return res.status(400).json({ message: 'paymentStatus is required.' });
    }

    const updated = await prisma.order.updateMany({
      where: { id, owner_id: req.user.id },
      data: { payment_status: paymentStatus }
    });

    if (updated.count === 0) {
      return res.status(404).json({ message: 'Order not found or unauthorized.' });
    }

    // Trigger SSE or socket broadcast if needed for table screen
    res.json({ message: `Order payment status successfully updated to: ${paymentStatus}` });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
