const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const { addDays } = require('date-fns')

const prisma = new PrismaClient()

async function main() {
  console.log("🧹 Cleaning database before seeding...");

  // 1. Delete child records first (records that depend on others)
  // This prevents Foreign Key Constraint errors
  await prisma.investment.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.kycSubmission.deleteMany({});

  // 2. Delete the parent records
  await prisma.plan.deleteMany({});
  await prisma.walletAddress.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("✅ Database cleared.");
  console.log('🌱 Seeding AurexConnect database...\n')

  // ── Admin user ──────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@123456', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@aurexconnect.com' },
    update: {},
    create: {
      email: 'admin@aurexconnect.com',
      password: adminPassword,
      fullName: 'AurexConnect Admin',
      role: 'ADMIN',
      kycStatus: 'APPROVED',
      isActive: true,
      referralCode: 'ADMIN001',
    },
  })
  console.log('✅ Admin user:', admin.email)

  // ── Demo investor ───────────────────────────────────────
  const userPassword = await bcrypt.hash('User@123456', 12)
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@aurexconnect.com' },
    update: {},
    create: {
      email: 'demo@aurexconnect.com',
      password: userPassword,
      fullName: 'Demo Investor',
      role: 'USER',
      kycStatus: 'APPROVED',
      isActive: true,
      balance: 5000,
      totalDeposited: 5000,
      referralCode: 'DEMO001',
    },
  })
  console.log('✅ Demo user:', demoUser.email)

  // ── Investment plans ────────────────────────────────────
  const plansData = [
    {
      name: 'Basic Plan',
      roiPercent: 8,
      minAmount: 200,
      maxAmount: 1999,
      durationDays: 7,
      referralBonus: 5,
      description: 'Quick returns. Perfect for beginners.',
      features: ['8% Daily ROI', '$200 – $1,999 Investment', '7 Day Duration', '5% Referral Bonus', '24/7 Support'],
    },
    {
      name: 'Golden Plan',
      roiPercent: 15,
      minAmount: 2000,
      maxAmount: 29000,
      durationDays: 14,
      referralBonus: 7,
      description: 'Higher returns for serious investors.',
      features: ['15% Daily ROI', '$2,000 – $29,000 Investment', '14 Day Duration', '7% Referral Bonus', 'Priority Support'],
    },
    {
      name: 'Mega Plan',
      roiPercent: 25,
      minAmount: 30000,
      maxAmount: 99000,
      durationDays: 30,
      referralBonus: 10,
      description: 'Maximum gains for committed investors.',
      features: ['25% Daily ROI', '$30,000 – $99,000 Investment', '30 Day Duration', '10% Referral Bonus', 'Dedicated Manager'],
    },
    {
      name: 'Premium plan',
      roiPercent: 50,
      minAmount: 100000,
      maxAmount: 500000,
      durationDays: 30,
      referralBonus: 15,
      description: 'Exclusive VIP tier with the highest returns.',
      features: ['50% Daily ROI', '$100,000+ Investment', '30 Day Duration', '15% Referral Bonus', 'VIP Account Manager'],
    },
  ]

  for (const plan of plansData) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: {},
      create: plan,
    })
  }
  console.log('✅ Investment plans seeded (4 plans)')

  // ── Wallet addresses ────────────────────────────────────
  const wallets = [
    { currency: 'BTC', label: 'Bitcoin (BTC)', address: 'Bc1qhgm7yze9p9hfr74q57kellpf35gz4y85tktdh4', network: 'mainnet' },
    { currency: 'ETH', label: 'Ethereum (ETH)', address: '0x29D3554E0e83eCD7De7329763E750B0143635f93', network: 'mainnet' },
    { currency: 'USDT', label: 'Tether (USDT/TRC20)', address: 'TSC9hepwW7mZW1oBmgKJQT3itWuNyKEgmm', network: 'TRC20' },
    { currency: 'XRP', label: 'Ripple (XRP)', address: 'rsMs2ejvc6bBJWNUCQXXYKzKGaYmgd5EpX', network: 'mainnet'}
  ]

  for (const wallet of wallets) {
    await prisma.walletAddress.upsert({
      where: { currency: wallet.currency },
      update: {},
      create: wallet,
    })
  }
  console.log('✅ Wallet addresses seeded')

  // ── Demo transactions and data ──────────────────────────
  const basicPlan = await prisma.plan.findUnique({ where: { name: 'Basic Plan' } })

  await prisma.transaction.create({
    data: {
      userId: demoUser.id,
      type: 'DEPOSIT',
      status: 'PENDING',
      amount: 500,
      currency: 'BTC',
      txHash: 'abc123demo456txhash789example',
      note: 'Demo pending deposit — review in admin panel',
    },
  })

  await prisma.kycSubmission.create({
    data: {
      userId: demoUser.id,
      documentType: 'passport',
      documentNumber: 'P12345678',
      frontImageUrl: 'https://via.placeholder.com/400x250/1a1a2e/c9a84c?text=Passport+Front',
      backImageUrl: 'https://via.placeholder.com/400x250/1a1a2e/c9a84c?text=Passport+Back',
      selfieUrl: 'https://via.placeholder.com/400x400/1a1a2e/c9a84c?text=Selfie+with+ID',
      status: 'PENDING',
    },
  })

  if (basicPlan) {
    const pastDate = addDays(new Date(), -2)
    await prisma.investment.create({
      data: {
        userId: demoUser.id,
        planId: basicPlan.id,
        amount: 200,
        expectedProfit: 16,
        status: 'ACTIVE',
        startDate: pastDate,
        endDate: new Date(),
      },
    })
  }

  await prisma.notification.create({
    data: {
      userId: demoUser.id,
      title: '👋 Welcome to AurexConnect',
      message: 'Your account is set up. Complete KYC verification to unlock full access.',
      type: 'info',
      link: '/dashboard/kyc',
    },
  })

  console.log('\n🎉 Seed complete!\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  Admin:  admin@aurexconnect.com / Admin@123456')
  console.log('  Demo:   demo@aurexconnect.com  / User@123456')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
