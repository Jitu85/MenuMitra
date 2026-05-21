const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { authenticateToken, requireOwner } = require('../middleware/auth');

// Initialize Razorpay Client helper
const getRazorpayClient = (keyId, keySecret) => {
  const kId = keyId || process.env.RAZORPAY_KEY_ID;
  const kSecret = keySecret || process.env.RAZORPAY_KEY_SECRET;

  if (!kId || !kSecret || kId.includes('mock') || kSecret.includes('mock')) {
    // Return null to signify mock mode
    return null;
  }

  try {
    return new Razorpay({
      key_id: kId,
      key_secret: kSecret
    });
  } catch (err) {
    console.warn('Failed to initialize Razorpay SDK. Falling back to offline mockup mode.', err);
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOMER PAYMENT CHECKOUT (PUBLIC)
// ─────────────────────────────────────────────────────────────────────────────

// Create Razorpay Order for customer checkouts
router.post('/create-order', async (req, res, next) => {
  const prisma = req.app.get('prisma');
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'orderId is required.' });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { owner: true }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Capture payment configuration (owner specific, or fallback to platform level)
    const keyId = order.owner?.razorpay_key_id;
    const keySecret = order.owner?.razorpay_key_secret;
    const client = getRazorpayClient(keyId, keySecret);

    const amountInPaise = Math.round(order.total_amount * 100);

    if (!client) {
      // ── MOCK/OFFLINE MODE ──
      console.log(`[Offline Payment] Creating mock Razorpay order for Amount: ₹${order.total_amount}`);
      const mockRazorpayOrderId = `rzp_order_${crypto.randomBytes(8).toString('hex')}`;

      // Store mock razorpay order id in database
      await prisma.order.update({
        where: { id: orderId },
        data: { razorpay_order_id: mockRazorpayOrderId }
      });

      return res.json({
        isMock: true,
        key: 'rzp_test_mockKey123',
        amount: amountInPaise,
        currency: 'INR',
        name: order.owner?.business_name || 'MenuMitra',
        description: 'Food Order Payment',
        order_id: mockRazorpayOrderId,
        prefill: {
          name: order.customer_name || 'Guest'
        }
      });
    }

    // ── LIVE MODE ──
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: order.id,
      payment_capture: 1
    };

    client.orders.create(options, async (err, rzOrder) => {
      if (err) {
        console.error('Razorpay Order Creation Error:', err);
        return res.status(500).json({ message: 'Failed to initiate gateway transaction.', error: err });
      }

      // Update order in DB with actual Razorpay Order ID
      await prisma.order.update({
        where: { id: orderId },
        data: { razorpay_order_id: rzOrder.id }
      });

      res.json({
        isMock: false,
        key: keyId || process.env.RAZORPAY_KEY_ID,
        amount: rzOrder.amount,
        currency: rzOrder.currency,
        name: order.owner?.business_name || 'MenuMitra',
        description: 'Food Order Payment',
        order_id: rzOrder.id,
        prefill: {
          name: order.customer_name || 'Guest'
        }
      });
    });
  } catch (err) {
    next(err);
  }
});

// Verification Endpoint for frontend payment callbacks
router.post('/verify', async (req, res, next) => {
  const prisma = req.app.get('prisma');
  const io = req.app.get('io');
  try {
    const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature, isMock } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'orderId is required for verification.' });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (isMock) {
      // ── MOCK VERIFICATION SUCCESS ──
      console.log(`[Offline Payment] Verifying and confirming mock payment for Order: ${order.order_number}`);
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          payment_status: 'paid',
          razorpay_payment_id: razorpayPaymentId || `pay_mock_${crypto.randomBytes(8).toString('hex')}`
        }
      });

      // Notify owner room of successful payment
      io.to(order.owner_id).emit('order_payment_update', {
        id: updatedOrder.id,
        orderNumber: updatedOrder.order_number,
        paymentStatus: 'paid',
        paymentMethod: 'razorpay'
      });

      return res.json({ status: 'success', message: 'Mock payment verified successfully!' });
    }

    // ── LIVE VERIFICATION ──
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(razorpayOrderId + '|' + razorpayPaymentId);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature === razorpaySignature) {
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          payment_status: 'paid',
          razorpay_payment_id: razorpayPaymentId
        }
      });

      io.to(order.owner_id).emit('order_payment_update', {
        id: updatedOrder.id,
        orderNumber: updatedOrder.order_number,
        paymentStatus: 'paid',
        paymentMethod: 'razorpay'
      });

      res.json({ status: 'success', message: 'Payment verified and updated successfully!' });
    } else {
      res.status(400).json({ status: 'failure', message: 'Signature verification failed.' });
    }
  } catch (err) {
    next(err);
  }
});

// webhook endpoint for asynchronous Razorpay notifications
router.post('/webhook', async (req, res, next) => {
  const prisma = req.app.get('prisma');
  const io = req.app.get('io');
  try {
    const signature = req.headers['x-razorpay-signature'];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify webhook signature (optional but recommended for production)
    if (secret && signature) {
      const shasum = crypto.createHmac('sha256', secret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest('hex');

      if (digest !== signature) {
        return res.status(400).json({ message: 'Invalid webhook signature.' });
      }
    }

    const event = req.body.event;
    console.log(`[Razorpay Webhook] Event received: ${event}`);

    if (event === 'payment.captured' || event === 'order.paid') {
      const rzOrderId = req.body.payload.payment.entity.order_id;
      const rzPaymentId = req.body.payload.payment.entity.id;

      // Update guest order status
      const matchedOrder = await prisma.order.findFirst({
        where: { razorpay_order_id: rzOrderId }
      });

      if (matchedOrder) {
        await prisma.order.update({
          where: { id: matchedOrder.id },
          data: {
            payment_status: 'paid',
            razorpay_payment_id: rzPaymentId
          }
        });

        // Notify merchant in real-time
        io.to(matchedOrder.owner_id).emit('order_payment_update', {
          id: matchedOrder.id,
          orderNumber: matchedOrder.order_number,
          paymentStatus: 'paid',
          paymentMethod: 'razorpay'
        });
      }
    }

    res.json({ status: 'ok' });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PROTECTED PAYMENT CONFIGURATION ROUTES (OWNER)
// ─────────────────────────────────────────────────────────────────────────────

router.use(authenticateToken);
router.use(requireOwner);

// Get merchant payment preferences
router.get('/settings', async (req, res, next) => {
  const prisma = req.app.get('prisma');
  try {
    const owner = await prisma.owner.findUnique({
      where: { id: req.user.id },
      select: {
        payment_method_pref: true,
        upi_id: true,
        upi_qr_image_url: true,
        razorpay_key_id: true
      }
    });

    if (!owner) {
      return res.status(404).json({ message: 'Merchant not found.' });
    }

    res.json(owner);
  } catch (err) {
    next(err);
  }
});

// Save Merchant Payment Preferences
router.put('/settings', async (req, res, next) => {
  const prisma = req.app.get('prisma');
  try {
    const { paymentMethodPref, upiId, upiQrImageUrl, razorpayKeyId, razorpayKeySecret } = req.body;

    const dataToUpdate = {
      payment_method_pref: paymentMethodPref
    };

    if (upiId !== undefined) dataToUpdate.upi_id = upiId || null;
    if (upiQrImageUrl !== undefined) dataToUpdate.upi_qr_image_url = upiQrImageUrl || null;
    if (razorpayKeyId !== undefined) dataToUpdate.razorpay_key_id = razorpayKeyId || null;
    if (razorpayKeySecret !== undefined) dataToUpdate.razorpay_key_secret = razorpayKeySecret || null;

    await prisma.owner.update({
      where: { id: req.user.id },
      data: dataToUpdate
    });

    res.json({ message: 'Merchant payment settings saved successfully!' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
