const express = require('express');
const router = express.Router();
const { authenticateToken, requireOwner } = require('../middleware/auth');

// Apply auth middlewares
router.use(authenticateToken);
router.use(requireOwner);

// Get Owner Profile
router.get('/profile', async (req, res, next) => {
  const prisma = req.app.get('prisma');
  try {
    const owner = await prisma.owner.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        business_name: true,
        business_type: true,
        owner_name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        pincode: true,
        gstin: true,
        fssai_license: true,
        table_count: true,
        unique_slug: true,
        subscription_status: true,
        subscription_expires: true,
        payment_method_pref: true,
        upi_id: true,
        upi_qr_image_url: true,
        profile_photo_url: true,
        created_at: true
      }
    });

    if (!owner) {
      return res.status(404).json({ message: 'Owner not found.' });
    }

    res.json(owner);
  } catch (err) {
    next(err);
  }
});

// Update Owner Profile
router.put('/profile', async (req, res, next) => {
  const prisma = req.app.get('prisma');
  try {
    const {
      businessName,
      businessType,
      ownerName,
      phone,
      address,
      city,
      state,
      pincode,
      gstin,
      fssaiLicense,
      profilePhotoUrl
    } = req.body;

    const updatedOwner = await prisma.owner.update({
      where: { id: req.user.id },
      data: {
        business_name: businessName,
        business_type: businessType,
        owner_name: ownerName,
        phone,
        address,
        city,
        state,
        pincode,
        gstin: gstin || null,
        fssai_license: fssaiLicense || null,
        profile_photo_url: profilePhotoUrl || null
      }
    });

    res.json({
      message: 'Profile updated successfully!',
      owner: {
        id: updatedOwner.id,
        businessName: updatedOwner.business_name,
        ownerName: updatedOwner.owner_name
      }
    });
  } catch (err) {
    next(err);
  }
});

// Get Dashboard Statistics
router.get('/stats', async (req, res, next) => {
  const prisma = req.app.get('prisma');
  try {
    const ownerId = req.user.id;

    // Time ranges
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 1. Today's Orders Count
    const todayOrdersCount = await prisma.order.count({
      where: {
        owner_id: ownerId,
        created_at: { gte: startOfToday }
      }
    });

    // 2. Today's Paid Revenue
    const todayRevenueAggregate = await prisma.order.aggregate({
      _sum: { total_amount: true },
      where: {
        owner_id: ownerId,
        payment_status: 'paid',
        created_at: { gte: startOfToday }
      }
    });
    const todayRevenue = todayRevenueAggregate._sum.total_amount || 0;

    // 3. This Month's Paid Revenue
    const monthRevenueAggregate = await prisma.order.aggregate({
      _sum: { total_amount: true },
      where: {
        owner_id: ownerId,
        payment_status: 'paid',
        created_at: { gte: startOfMonth }
      }
    });
    const monthRevenue = monthRevenueAggregate._sum.total_amount || 0;

    // 4. Total Active Menu Items
    const totalMenuItems = await prisma.foodItem.count({
      where: { owner_id: ownerId }
    });

    // 5. Subscription Status details
    const owner = await prisma.owner.findUnique({
      where: { id: ownerId },
      select: {
        subscription_status: true,
        subscription_expires: true
      }
    });

    // Days remaining on subscription
    let daysRemaining = 0;
    if (owner.subscription_expires) {
      const diffTime = new Date(owner.subscription_expires) - now;
      daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    // 6. Recent Orders (limit to 10)
    const recentOrders = await prisma.order.findMany({
      where: { owner_id: ownerId },
      orderBy: { created_at: 'desc' },
      take: 10,
      include: {
        items: true
      }
    });

    res.json({
      todayOrdersCount,
      todayRevenue,
      monthRevenue,
      totalMenuItems,
      subscriptionStatus: owner.subscription_status,
      subscriptionExpires: owner.subscription_expires,
      daysRemaining,
      recentOrders: recentOrders.map(o => ({
        id: o.id,
        orderNumber: o.order_number,
        tableNumber: o.table_number,
        customerName: o.customer_name || 'Guest',
        totalAmount: o.total_amount,
        paymentMethod: o.payment_method || 'N/A',
        paymentStatus: o.payment_status,
        createdAt: o.created_at,
        items: o.items.map(item => ({
          nameEn: item.item_name_en,
          qty: item.quantity,
          price: item.unit_price
        }))
      }))
    });
  } catch (err) {
    next(err);
  }
});

// Get Analytics Data for Charts
router.get('/analytics', async (req, res, next) => {
  const prisma = req.app.get('prisma');
  try {
    const ownerId = req.user.id;

    // Aggregate monthly revenue for line chart
    const orders = await prisma.order.findMany({
      where: {
        owner_id: ownerId,
        payment_status: 'paid'
      },
      select: {
        total_amount: true,
        created_at: true
      },
      orderBy: { created_at: 'asc' }
    });

    // Group sales by day of week or date
    const dailySalesMap = {};
    orders.forEach(order => {
      const dateStr = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dailySalesMap[dateStr] = (dailySalesMap[dateStr] || 0) + order.total_amount;
    });

    const salesOverTime = Object.keys(dailySalesMap).map(key => ({
      date: key,
      revenue: dailySalesMap[key]
    })).slice(-15); // limit to last 15 active days

    // Top selling items (aggregated)
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          owner_id: ownerId,
          payment_status: 'paid'
        }
      },
      select: {
        item_name_en: true,
        quantity: true,
        total_price: true
      }
    });

    const itemSalesMap = {};
    orderItems.forEach(item => {
      if (!itemSalesMap[item.item_name_en]) {
        itemSalesMap[item.item_name_en] = { name: item.item_name_en, units: 0, sales: 0 };
      }
      itemSalesMap[item.item_name_en].units += item.quantity;
      itemSalesMap[item.item_name_en].sales += item.total_price;
    });

    const topSellingItems = Object.values(itemSalesMap)
      .sort((a, b) => b.units - a.units)
      .slice(0, 5);

    // Peak Order Hours analysis
    const allOrders = await prisma.order.findMany({
      where: { owner_id: ownerId },
      select: { created_at: true }
    });

    const hoursDistribution = Array(24).fill(0);
    allOrders.forEach(order => {
      const hr = new Date(order.created_at).getHours();
      hoursDistribution[hr]++;
    });

    const peakHours = hoursDistribution.map((count, index) => ({
      hour: `${index}:00`,
      orders: count
    }));

    res.json({
      salesOverTime,
      topSellingItems,
      peakHours
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
