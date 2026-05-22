const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');

// Generate and return QR Code as data URL (with custom Saffron/Ivory branding colors)
router.get('/generate/:slug', async (req, res, next) => {
  const prisma = req.app.get('prisma');
  try {
    const { slug } = req.params;

    // Verify slug exists
    const owner = await prisma.owner.findUnique({
      where: { unique_slug: slug }
    });

    if (!owner) {
      return res.status(404).json({ message: 'Merchant slug not found.' });
    }

    const frontendBaseUrl = process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? 'https://menu-mitra.vercel.app' : 'http://localhost:3000');
    const menuUrl = `${frontendBaseUrl}/menu/${slug}`;

    // Generate branded QR Code
    const qrDataUrl = await QRCode.toDataURL(menuUrl, {
      color: {
        dark: '#E8650A',  // Deep Saffron primary color
        light: '#FFF8F0' // Ivory White background color
      },
      width: 600,
      margin: 2,
      errorCorrectionLevel: 'H' // High density support for scanning under sub-optimal lighting
    });

    res.json({
      slug,
      menuUrl,
      qrCodeDataUrl: qrDataUrl,
      branding: {
        foreground: '#E8650A',
        background: '#FFF8F0'
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
