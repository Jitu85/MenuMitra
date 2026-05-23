// Pre-load environment variables for Prisma seeding
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Seed Subscription Plan
  const planName = 'MenuMitra Standard';
  const planPrice = 100.00;
  const planTrialDays = 30;
  const planFeatures = [
    'Unlimited Menu Items',
    'Unlimited Categories',
    'Unique QR Code',
    'UPI QR & Razorpay Support',
    'Bilingual Menu (EN/HI)',
    'Real-time Order Alerts',
    'Sales & Revenue Analytics',
    'Browser & Thermal Print Receipts'
  ];

  // Upsert the standard plan
  const plan = await prisma.subscriptionPlan.create({
    data: {
      plan_name: planName,
      price_monthly: planPrice,
      trial_days: planTrialDays,
      features: JSON.stringify(planFeatures),
      is_active: true
    }
  });

  console.log(`Seeded subscription plan: ${plan.plan_name} (ID: ${plan.id})`);

  // 2. Seed Super Admin
  const adminLoginId = 'Jitu';
  const adminEmail = 'abhijit.jituwreath@gmail.com';
  const adminName = 'Abhijit Kumar Misra';
  const plainPassword = 'admin123';

  // Check if admin already exists
  const existingAdmin = await prisma.admin.findUnique({
    where: { login_id: adminLoginId }
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(plainPassword, 12);
    const admin = await prisma.admin.create({
      data: {
        name: adminName,
        login_id: adminLoginId,
        email: adminEmail,
        password_hash: passwordHash
      }
    });
    console.log(`Seeded Super Admin: ${admin.name} (Login ID: ${admin.login_id})`);
  } else {
    console.log('Super Admin already exists, skipping.');
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
