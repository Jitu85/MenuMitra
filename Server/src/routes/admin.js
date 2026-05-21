const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Apply auth middlewares
router.use(authenticateToken);
router.use(requireAdmin);

// ─────────────────────────────────────────────────────────────────────────────
// PLATFORM STATISTICS
// ─────────────────────────────────────────────────────────────────────────────

router.get('/stats', async (req, res, next) => {
  const prisma = req.app.get('prisma');
  try {
    const totalOwners = await prisma.owner.count();
    
    const activeSubs = await prisma.owner.count({
      where: { subscription_status: 'active' }
    });

    const trialSubs = await prisma.owner.count({
      where: { subscription_status: 'trial' }
    });

    const expiredSubs = await prisma.owner.count({
      where: { subscription_status: 'expired' }
    });

    // Calculate platform revenue (sum of all standard subscriptions)
    const revenueAggregate = await prisma.subscription.aggregate({
      _sum: { amount_paid: true }
    });
    const platformRevenue = revenueAggregate._sum.amount_paid || 0;

    res.json({
      totalOwners,
      activeSubs,
      trialSubs,
      expiredSubs,
      platformRevenue,
      developer: 'Abhijit Kumar Misra'
    });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// MERCHANT / OWNER MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

// Get all owners (merchant directory with search & filters)
router.get('/owners', async (req, res, next) => {
  const prisma = req.app.get('prisma');
  try {
    const { search, status, type } = req.query;

    const filter = {};
    if (status) {
      filter.subscription_status = status;
    }
    if (type) {
      filter.business_type = type;
    }
    if (search) {
      filter.OR = [
        { business_name: { contains: search } },
        { owner_name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } }
      ];
    }

    const owners = await prisma.owner.findMany({
      where: filter,
      orderBy: { created_at: 'desc' }
    });

    res.json(owners.map(o => ({
      id: o.id,
      businessName: o.business_name,
      businessType: o.business_type,
      ownerName: o.owner_name,
      email: o.email,
      phone: o.phone,
      city: o.city,
      state: o.state,
      isActive: o.is_active,
      subscriptionStatus: o.subscription_status,
      subscriptionExpires: o.subscription_expires,
      createdAt: o.created_at
    })));
  } catch (err) {
    next(err);
  }
});

// Get Owner details by ID
router.get('/owners/:id', async (req, res, next) => {
  const prisma = req.app.get('prisma');
  try {
    const { id } = req.params;

    const owner = await prisma.owner.findUnique({
      where: { id },
      include: {
        subscriptions: { orderBy: { created_at: 'desc' } },
        orders: { orderBy: { created_at: 'desc' }, take: 10 }
      }
    });

    if (!owner) {
      return res.status(404).json({ message: 'Merchant account not found.' });
    }

    res.json({
      id: owner.id,
      businessName: owner.business_name,
      businessType: owner.business_type,
      ownerName: owner.owner_name,
      email: owner.email,
      phone: owner.phone,
      address: owner.address,
      city: owner.city,
      state: owner.state,
      pincode: owner.pincode,
      gstin: owner.gstin,
      fssaiLicense: owner.fssai_license,
      tableCount: owner.table_count,
      uniqueSlug: owner.unique_slug,
      isActive: owner.is_active,
      subscriptionStatus: owner.subscription_status,
      subscriptionExpires: owner.subscription_expires,
      upiId: owner.upi_id,
      upiQrImageUrl: owner.upi_qr_image_url,
      profilePhotoUrl: owner.profile_photo_url,
      createdAt: owner.created_at,
      subscriptions: owner.subscriptions.map(s => ({
        id: s.id,
        amount: s.amount_paid,
        startDate: s.start_date,
        endDate: s.end_date,
        paymentId: s.razorpay_payment_id || 'Mock/Override',
        status: s.status
      })),
      orders: owner.orders.map(ord => ({
        id: ord.id,
        orderNumber: ord.order_number,
        tableNumber: ord.table_number,
        totalAmount: ord.total_amount,
        paymentStatus: ord.payment_status,
        createdAt: ord.created_at
      }))
    });
  } catch (err) {
    next(err);
  }
});

// Activate / Deactivate merchant account
router.put('/owners/:id/status', async (req, res, next) => {
  const prisma = req.app.get('prisma');
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({ message: 'isActive parameter is required.' });
    }

    const updated = await prisma.owner.update({
      where: { id },
      data: { is_active: !!isActive }
    });

    await prisma.auditLog.create({
      data: {
        actor_id: req.user.id,
        actor_role: 'admin',
        action: isActive ? 'ACTIVATE_ACCOUNT' : 'DEACTIVATE_ACCOUNT',
        target_type: 'owner',
        target_id: id,
        details: JSON.stringify({ message: `Admin ${req.user.login_id} updated owner status.` })
      }
    });

    res.json({ message: `Account status updated successfully to: ${isActive ? 'Active' : 'Suspended'}` });
  } catch (err) {
    next(err);
  }
});

// Admin override subscription dates manually (Goodwill override)
router.put('/owners/:id/override-subscription', async (req, res, next) => {
  const prisma = req.app.get('prisma');
  try {
    const { id } = req.params;
    const { status, expiresAt } = req.body;

    if (!status || !expiresAt) {
      return res.status(400).json({ message: 'Both subscription status and expiry dates are required for manual overrides.' });
    }

    const nextExpiresDate = new Date(expiresAt);

    await prisma.$transaction([
      prisma.owner.update({
        where: { id },
        data: {
          subscription_status: status,
          subscription_expires: nextExpiresDate
        }
      }),
      prisma.auditLog.create({
        data: {
          actor_id: req.user.id,
          actor_role: 'admin',
          action: 'MANUAL_SUBSCRIPTION_OVERRIDE',
          target_type: 'owner',
          target_id: id,
          details: JSON.stringify({
            message: `Admin manually set subscription status to ${status} and expiry to ${nextExpiresDate.toDateString()}`
          })
        }
      })
    ]);

    res.json({ message: 'Subscription parameters updated successfully by administrator!' });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PLATFORM AUDIT LOGS
// ─────────────────────────────────────────────────────────────────────────────

router.get('/audit', async (req, res, next) => {
  const prisma = req.app.get('prisma');
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { created_at: 'desc' },
      take: 100 // show latest 100 entries
    });

    res.json(logs.map(l => ({
      id: l.id,
      actorId: l.actor_id,
      actorRole: l.actor_role,
      action: l.action,
      targetType: l.target_type,
      targetId: l.target_id,
      details: l.details,
      createdAt: l.created_at
    })));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
