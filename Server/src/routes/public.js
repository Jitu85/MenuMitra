const express = require('express');
const router = express.Router();

// Fetch Guest Menu by Business Slug
router.get('/menu/:slug', async (req, res, next) => {
  const prisma = req.app.get('prisma');
  try {
    const { slug } = req.params;

    const owner = await prisma.owner.findUnique({
      where: { unique_slug: slug },
      include: {
        categories: {
          orderBy: { sort_order: 'asc' },
          include: {
            food_items: {
              orderBy: { sort_order: 'asc' }
            }
          }
        }
      }
    });

    if (!owner) {
      return res.status(404).json({ message: 'Restaurant digital menu not found.' });
    }

    if (!owner.is_active) {
      return res.status(403).json({ message: 'This restaurant digital menu is currently inactive.' });
    }

    // Check if subscription has expired
    const now = new Date();
    const isExpired = owner.subscription_status === 'expired' || 
                      (owner.subscription_expires && new Date(owner.subscription_expires) < now);

    if (isExpired) {
      return res.status(403).json({
        message: 'Menu temporarily unavailable.',
        reason: 'subscription_lapsed',
        businessName: owner.business_name
      });
    }

    // Structure response for Guest/Customer view
    res.json({
      id: owner.id,
      businessName: owner.business_name,
      businessType: owner.business_type,
      address: owner.address,
      city: owner.city,
      tableCount: owner.table_count,
      paymentMethodPref: owner.payment_method_pref,
      upiId: owner.upi_id,
      upiQrImageUrl: owner.upi_qr_image_url,
      profilePhotoUrl: owner.profile_photo_url,
      categories: owner.categories.map(cat => ({
        id: cat.id,
        name: cat.name_en,
        items: cat.food_items.map(item => ({
          id: item.id,
          name: item.name_en,
          description: item.description_en,
          price: item.price,
          photoUrl: item.photo_url,
          isVeg: item.is_veg,
          isAvailable: item.is_available
        }))
      }))
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
