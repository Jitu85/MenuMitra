const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Helper to generate a URL-friendly unique slug from business name + city
const generateSlug = async (prisma, businessName, city) => {
  let baseSlug = `${businessName}-${city}`
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       // Replace spaces with -
    .replace(/[^\w\-]+/g, '')   // Remove non-word chars
    .replace(/\-\-+/g, '-');    // Remove double dashes

  let uniqueSlug = baseSlug;
  let exists = true;
  let counter = 0;

  while (exists) {
    const owner = await prisma.owner.findUnique({
      where: { unique_slug: uniqueSlug }
    });
    if (!owner) {
      exists = false;
    } else {
      counter++;
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      uniqueSlug = `${baseSlug}-${randomSuffix}`;
    }
  }
  return uniqueSlug;
};

// Owner Registration / Sign Up
const handleRegister = async (req, res, next) => {
  const prisma = req.app.get('prisma');
  try {
    const {
      businessName, business_name,
      businessType, business_type,
      ownerName, owner_name,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      tableCount, table_count,
      gstin,
      fssaiLicense, fssai_license,
      password
    } = req.body;

    const finalBusinessName = businessName || business_name;
    const finalBusinessType = businessType || business_type;
    const finalOwnerName = ownerName || owner_name;
    const finalTableCount = tableCount !== undefined ? tableCount : table_count;
    const finalFssaiLicense = fssaiLicense || fssai_license;

    if (!finalBusinessName || !finalBusinessType || !finalOwnerName || !email || !phone || !password) {
      return res.status(400).json({ message: 'Missing required registration parameters.' });
    }

    // Check if email or phone already registered
    const existingEmail = await prisma.owner.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email address is already registered.' });
    }

    const existingPhone = await prisma.owner.findUnique({ where: { phone } });
    if (existingPhone) {
      return res.status(400).json({ message: 'Phone number is already registered.' });
    }

    // Auto-generate a unique slug
    const slug = await generateSlug(prisma, finalBusinessName, city);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Trial expiry date (30 days from now)
    const trialExpiry = new Date();
    trialExpiry.setDate(trialExpiry.getDate() + 30);

    // Create Owner with default Trial plan parameters
    const newOwner = await prisma.owner.create({
      data: {
        business_name: finalBusinessName,
        business_type: finalBusinessType,
        owner_name: finalOwnerName,
        email,
        phone,
        password_hash: hashedPassword,
        address,
        city,
        state,
        pincode,
        table_count: finalTableCount ? parseInt(finalTableCount, 10) : 10,
        gstin: gstin || null,
        fssai_license: finalFssaiLicense || null,
        unique_slug: slug,
        subscription_status: 'trial',
        subscription_expires: trialExpiry,
        payment_method_pref: 'both'
      }
    });

    // Create default audit log entry
    await prisma.auditLog.create({
      data: {
        actor_id: newOwner.id,
        actor_role: 'owner',
        action: 'REGISTER',
        target_type: 'owner',
        target_id: newOwner.id,
        details: JSON.stringify({ message: 'Owner registered successfully. 30-day trial initiated.' })
      }
    });

    // Generate JWT Token for login session
    const token = jwt.sign(
      { id: newOwner.id, email: newOwner.email, slug: newOwner.unique_slug },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userProfile = {
      id: newOwner.id,
      businessName: newOwner.business_name,
      slug: newOwner.unique_slug,
      subscriptionStatus: newOwner.subscription_status,
      subscriptionExpires: newOwner.subscription_expires
    };

    res.status(201).json({
      message: 'Owner registered successfully! 30-day free trial has been initiated.',
      token,
      role: 'owner',
      user: userProfile,
      owner: userProfile
    });
  } catch (err) {
    next(err);
  }
};

router.post('/register', handleRegister);
router.post('/signup', handleRegister);

// Owner Login
router.post('/login', async (req, res, next) => {
  const prisma = req.app.get('prisma');
  try {
    const { email, password } = req.body;

    const owner = await prisma.owner.findUnique({
      where: { email }
    });

    if (!owner) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (!owner.is_active) {
      return res.status(403).json({ message: 'Account is deactivated. Please contact support.' });
    }

    const isMatch = await bcrypt.compare(password, owner.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Generate token
    const token = jwt.sign(
      { id: owner.id, email: owner.email, slug: owner.unique_slug },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Update updated_at for login time if needed
    await prisma.owner.update({
      where: { id: owner.id },
      data: { updated_at: new Date() }
    });

    const userProfile = {
      id: owner.id,
      businessName: owner.business_name,
      slug: owner.unique_slug,
      subscriptionStatus: owner.subscription_status,
      subscriptionExpires: owner.subscription_expires,
      role: 'owner'
    };

    res.json({
      message: 'Login successful!',
      token,
      role: 'owner',
      user: userProfile,
      owner: userProfile
    });
  } catch (err) {
    next(err);
  }
});

// Admin Login
router.post('/admin/login', async (req, res, next) => {
  const prisma = req.app.get('prisma');
  try {
    const { loginId, login_id, password } = req.body;
    const finalLoginId = loginId || login_id;

    if (!finalLoginId) {
      return res.status(400).json({ message: 'Operator ID is required.' });
    }

    const admin = await prisma.admin.findUnique({
      where: { login_id: finalLoginId }
    });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid Admin Login ID or password.' });
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid Admin Login ID or password.' });
    }

    const token = jwt.sign(
      { id: admin.id, login_id: admin.login_id, email: admin.email, role: 'admin' },
      process.env.JWT_ADMIN_SECRET,
      { expiresIn: '2h' }
    );

    // Log the success login
    await prisma.admin.update({
      where: { id: admin.id },
      data: { last_login: new Date() }
    });

    res.json({
      message: 'Super Admin login successful!',
      token,
      role: 'admin',
      user: {
        id: admin.id,
        loginId: admin.login_id,
        name: admin.name,
        role: 'admin'
      },
      admin: {
        id: admin.id,
        loginId: admin.login_id,
        name: admin.name,
        role: 'admin'
      }
    });
  } catch (err) {
    next(err);
  }
});

// Send Forgot Password OTP / Reset Token Link
router.post('/forgot-password', async (req, res, next) => {
  const prisma = req.app.get('prisma');
  try {
    const { email } = req.body;
    const owner = await prisma.owner.findUnique({ where: { email } });

    if (!owner) {
      return res.status(404).json({ message: 'No account found with this email address.' });
    }

    // Generate random 6-digit verification code/token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date();
    tokenExpiry.setMinutes(tokenExpiry.getMinutes() + 30); // 30 mins limit

    // Store in DB
    await prisma.passwordResetToken.create({
      data: {
        owner_id: owner.id,
        token: resetToken,
        expires_at: tokenExpiry
      }
    });

    // Mock configuration of SMTP Nodemailer or live credentials
    // Note: To send emails, user must configure active credentials in EMAIL_PASS
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASS
      }
    });

    const frontendBaseUrl = process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? 'https://menu-mitra.vercel.app' : 'http://localhost:3000');
    const resetLink = `${frontendBaseUrl}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"MenuMitra Support" <${process.env.EMAIL_FROM}>`,
      to: owner.email,
      subject: 'MenuMitra — Password Reset Link',
      html: `
        <h3>Hello ${owner.owner_name},</h3>
        <p>You are receiving this email because you requested a password reset for your MenuMitra merchant account.</p>
        <p>Please click the following link to reset your password. This link is valid for 30 minutes.</p>
        <a href="${resetLink}" style="display:inline-block; padding:10px 20px; background-color:#E8650A; color:white; text-decoration:none; border-radius:5px; margin: 10px 0;">Reset Password</a>
        <p>If you did not request this, please ignore this email.</p>
        <br/>
        <p>Regards,<br/>MenuMitra Team<br/>Developed by Abhijit Kumar Misra</p>
      `
    };

    // Send email (handling failures silently for local debugging mock, so server does not crash)
    try {
      await transporter.sendMail(mailOptions);
      res.json({ message: 'Password reset link sent to your email successfully.' });
    } catch (mailErr) {
      console.warn('Mail transporter failed, printing link to terminal for offline use:', resetLink);
      res.json({
        message: 'Mail server offline. Reset token generated successfully.',
        devTokenLink: resetLink // Return to client in development so they can complete forgot-password easily!
      });
    }
  } catch (err) {
    next(err);
  }
});

// Reset Password
router.post('/reset-password', async (req, res, next) => {
  const prisma = req.app.get('prisma');
  try {
    const { token, newPassword } = req.body;

    const resetTokenRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { owner: true }
    });

    if (!resetTokenRecord || resetTokenRecord.used || resetTokenRecord.expires_at < new Date()) {
      return res.status(400).json({ message: 'Invalid, used or expired reset token.' });
    }

    // Hash new password
    const newHashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and mark token as used
    await prisma.$transaction([
      prisma.owner.update({
        where: { id: resetTokenRecord.owner_id },
        data: { password_hash: newHashedPassword }
      }),
      prisma.passwordResetToken.update({
        where: { id: resetTokenRecord.id },
        data: { used: true }
      }),
      prisma.auditLog.create({
        data: {
          actor_id: resetTokenRecord.owner_id,
          actor_role: 'owner',
          action: 'PASSWORD_RESET',
          target_type: 'owner',
          target_id: resetTokenRecord.owner_id,
          details: JSON.stringify({ message: 'Password reset completed via token.' })
        }
      })
    ]);

    res.json({ message: 'Password has been reset successfully. You can now login with your new password.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
