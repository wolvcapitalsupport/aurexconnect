const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const { addDays } = require('date-fns')

const prisma = new PrismaClient()

async function main() {
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
  const plans = [
    {
      name: 'Gold Plan',
      roiPercent: 8,
      minAmount: 50,
      maxAmount: 999,
      durationDays: 1,
      referralBonus: 5,
      description: 'Quick 24-hour returns. Perfect for beginners.',
      features: ['8% Daily ROI', '$50 – $999 Investment', '24 Hour Duration', '5% Referral Bonus', '24/7 Support'],
    },
    {
      name: 'Platinum Plan',
      roiPercent: 15,
      minAmount: 1000,
      maxAmount: 4999,
      durationDays: 3,
      referralBonus: 7,
      description: 'Higher returns over 3 days for serious investors.',
      features: ['15% ROI in 3 Days', '$1,000 – $4,999 Investment', '3 Day Duration', '7% Referral Bonus', 'Priority Support'],
    },
    {
      name: 'Diamond Plan',
      roiPercent: 25,
      minAmount: 5000,
      maxAmount: 19999,
      durationDays: 7,
      referralBonus: 10,
      description: 'Maximum weekly gains for committed investors.',
      features: ['25% ROI in 7 Days', '$5,000 – $19,999 Investment', '7 Day Duration', '10% Referral Bonus', 'Dedicated Manager'],
    },
    {
      name: 'VIP Plan',
      roiPercent: 50,
      minAmount: 20000,
      maxAmount: 500000,
      durationDays: 14,
      referralBonus: 15,
      description: 'Exclusive VIP tier with the highest returns.',
      features: ['50% ROI in 14 Days', '$20,000+ Investment', '14 Day Duration', '15% Referral Bonus', 'VIP Account Manager'],
    },
  ]

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: {},
      create: plan,
    })
  }
  console.log('✅ Investment plans seeded (4 plans)')

  // ── Wallet addresses ────────────────────────────────────
  const wallets = [
    { currency: 'BTC', label: 'Bitcoin (BTC)', address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', network: 'mainnet' },
    { currency: 'ETH', label: 'Ethereum (ETH)', address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', network: 'mainnet' },
    { currency: 'USDT', label: 'Tether (USDT/TRC20)', address: 'TN3W4T8AYBFn9NkqL3b4W8ZkbPbXsAcRsM', network: 'TRC20' },
  ]

  for (const wallet of wallets) {
    await prisma.walletAddress.upsert({
      where: { currency: wallet.currency },
      update: {},
      create: wallet,
    })
  }
  console.log('✅ Wallet addresses seeded')

  // ── Demo: pending deposit for admin to review ───────────
  const goldPlan = await prisma.plan.findUnique({ where: { name: 'Gold Plan' } })

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
  console.log('✅ Demo pending deposit created')

  // ── Demo: pending KYC for admin to review ──────────────
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

  // Update demo user KYC status to pending for this demo
  await prisma.user.update({
    where: { id: demoUser.id },
    data: { kycStatus: 'PENDING' },
  })
  console.log('✅ Demo KYC submission created')

  // ── Demo: active investment (for ROI engine demo) ──────
  if (goldPlan) {
    const pastDate = addDays(new Date(), -2) // already due
    await prisma.investment.create({
      data: {
        userId: demoUser.id,
        planId: goldPlan.id,
        amount: 200,
        expectedProfit: 16, // 8% of 200
        status: 'ACTIVE',
        startDate: pastDate,
        endDate: new Date(), // due now — will be picked up by ROI engine
      },
    })
    console.log('✅ Demo matured investment created (run ROI engine to process)')
  }

  // ── Welcome notification ────────────────────────────────
  await prisma.notification.create({
    data: {
      userId: demoUser.id,
      title: '👋 Welcome to AurexConnect',
      message: 'Your account is set up. Complete KYC verification to unlock full access and start investing.',
      type: 'info',
      link: '/dashboard/kyc',
    },
  })
  console.log('✅ Welcome notification created')

  console.log('\n🎉 Seed complete!\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  Admin:  admin@aurexconnect.com / Admin@123456')
  console.log('  Demo:   demo@aurexconnect.com  / User@123456')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\nDemo data includes:')
  console.log('  → 1 pending deposit (approve in Admin → Deposits)')
  console.log('  → 1 pending KYC    (review in Admin → KYC Review)')
  console.log('  → 1 matured investment (trigger ROI engine to process)')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
