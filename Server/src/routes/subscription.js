const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { authenticateToken, requireOwner } = require('../middleware/auth');
const Razorpay = require('razorpay');

// Apply auth middlewares
router.use(authenticateToken);
router.use(requireOwner);

// Helper to check for Razorpay client
const getRazorpayClient = () => {
  const kId = process.env.RAZORPAY_KEY_ID;
  const kSecret = process.env.RAZORPAY_KEY_SECRET;

  if (!kId || !kSecret || kId.includes('mock') || kSecret.includes('mock')) {
    return null;
  }
  try {
    return new Razorpay({ key_id: kId, key_secret: kSecret });
  } catch (err) {
    return null;
  }
};

// Get Merchant Current Subscription
router.get('/', async (req, res, next) => {
  const prisma = req.app.get('prisma');
  try {
    const owner = await prisma.owner.findUnique({
      where: { id: req.user.id },
      select: {
        subscription_status: true,
        subscription_expires: true
      }
    });

    const recentSub = await prisma.subscription.findFirst({
      where: { owner_id: req.user.id },
      orderBy: { created_at: 'desc' },
      include: { plan: true }
    });

    res.json({
      status: owner.subscription_status,
      expiresAt: owner.subscription_expires,
      planName: recentSub?.plan?.plan_name || 'MenuMitra Free Trial',
      price: recentSub?.plan?.price_monthly || 0,
      currency: recentSub?.currency || 'INR'
    });
  } catch (err) {
    next(err);
  }
});

// Get Subscription Payments Billing History
router.get('/history', async (req, res, next) => {
  const prisma = req.app.get('prisma');
  try {
    const history = await prisma.subscription.findMany({
      where: { owner_id: req.user.id },
      include: { plan: true },
      orderBy: { created_at: 'desc' }
    });

    res.json(history.map(h => ({
      id: h.id,
      planName: h.plan.plan_name,
      amountPaid: h.amount_paid,
      currency: h.currency,
      paymentId: h.razorpay_payment_id || 'N/A',
      startDate: h.start_date,
      endDate: h.end_date,
      status: h.status,
      createdAt: h.created_at
    })));
  } catch (err) {
    next(err);
  }
});

// Create Razorpay Order for Subscriptions Renew / Upgrade (₹100 flat standard plan)
router.post('/create-checkout', async (req, res, next) => {
  const prisma = req.app.get('prisma');
  try {
    const standardPlan = await prisma.subscriptionPlan.findFirst({
      where: { plan_name: 'MenuMitra Standard' }
    });

    if (!standardPlan) {
      return res.status(404).json({ message: 'Standard subscription plan not found.' });
    }

    const pricePaise = Math.round(standardPlan.price_monthly * 100);
    const client = getRazorpayClient();

    if (!client) {
      // ── OFFLINE MOCK SUBSCRIPTION ──
      console.log(`[Offline Payment] Creating mock Razorpay subscription checkout for amount ₹100`);
      return res.json({
        isMock: true,
        key: 'rzp_test_mockKey123',
        amount: pricePaise,
        currency: 'INR',
        name: 'MenuMitra Merchant Portal',
        description: 'Upgrade to Standard Merchant Plan (1 Month)',
        order_id: `rzp_suborder_${crypto.randomBytes(8).toString('hex')}`,
        planId: standardPlan.id
      });
    }

    // ── LIVE MODE ──
    const options = {
      amount: pricePaise,
      currency: 'INR',
      receipt: `sub_${req.user.id}_${Date.now()}`,
      payment_capture: 1
    };

    client.orders.create(options, (err, rzOrder) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to initiate gateway transaction for subscription.', error: err });
      }

      res.json({
        isMock: false,
        key: process.env.RAZORPAY_KEY_ID,
        amount: rzOrder.amount,
        currency: rzOrder.currency,
        name: 'MenuMitra Merchant Portal',
        description: 'Upgrade to Standard Merchant Plan (1 Month)',
        order_id: rzOrder.id,
        planId: standardPlan.id
      });
    });
  } catch (err) {
    next(err);
  }
});

// Verify Subscription Payment and Activate Account
router.post('/verify-checkout', async (req, res, next) => {
  const prisma = req.app.get('prisma');
  try {
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature, planId, isMock } = req.body;

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      return res.status(404).json({ message: 'Requested plan not found.' });
    }

    const verifySuccess = () => {
      if (isMock) return true;

      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      const hmac = crypto.createHmac('sha256', keySecret);
      hmac.update(razorpayOrderId + '|' + razorpayPaymentId);
      const generatedSignature = hmac.digest('hex');
      return generatedSignature === razorpaySignature;
    };

    if (!verifySuccess()) {
      return res.status(400).json({ message: 'Subscription payment signature verification failed.' });
    }

    // Activate subscription: renew for 30 days from either today or previous expiry (whichever is later)
    const owner = await prisma.owner.findUnique({
      where: { id: req.user.id }
    });

    const now = new Date();
    let baseDate = now;

    if (owner.subscription_expires && owner.subscription_expires > now) {
      baseDate = new Date(owner.subscription_expires);
    }

    const nextExpiry = new Date(baseDate);
    nextExpiry.setDate(nextExpiry.getDate() + 30);

    const payId = razorpayPaymentId || `pay_mock_${crypto.randomBytes(8).toString('hex')}`;

    // Update owner subscription status inside transaction
    await prisma.$transaction([
      prisma.owner.update({
        where: { id: req.user.id },
        data: {
          subscription_status: 'active',
          subscription_expires: nextExpiry
        }
      }),
      prisma.subscription.create({
        data: {
          owner_id: req.user.id,
          plan_id: planId,
          amount_paid: plan.price_monthly,
          currency: 'INR',
          razorpay_payment_id: payId,
          start_date: baseDate,
          end_date: nextExpiry,
          status: 'active'
        }
      }),
      prisma.auditLog.create({
        data: {
          actor_id: req.user.id,
          actor_role: 'owner',
          action: 'SUBSCRIBE',
          target_type: 'subscription',
          details: JSON.stringify({ message: `Subscribed to ${plan.plan_name} plan. Expiry: ${nextExpiry}` })
        }
      })
    ]);

    res.json({
      status: 'success',
      message: 'Subscription successfully activated/renewed!',
      expiresAt: nextExpiry
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
