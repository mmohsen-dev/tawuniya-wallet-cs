import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tawuniya.com' },
    update: {},
    create: {
      email: 'admin@tawuniya.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'admin',
      wallet: {
        create: {
          balance: 0,
          totalEarned: 0,
          totalBurned: 0,
        },
      },
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create demo user
  const userPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'ahmed@example.com' },
    update: {},
    create: {
      email: 'ahmed@example.com',
      password: userPassword,
      name: 'Ahmed Mohammed',
      role: 'user',
      wallet: {
        create: {
          balance: 0,
          totalEarned: 0,
          totalBurned: 0,
        },
      },
    },
  });

  console.log('✅ Demo user created:', user.email);

  // Create configurations FIRST (so we can link services to them)
  const configs = [
    {
      key: 'car_wash_earn_rate',
      value: '10',
      description: '10 points per 100 SAR spent on car wash',
    },
    {
      key: 'insurance_earn_rate',
      value: '15',
      description: '15 points per 100 SAR spent on insurance',
    },
    {
      key: 'car_service_earn_rate',
      value: '12',
      description: '12 points per 100 SAR spent on car service',
    },
    {
      key: 'burn_rate',
      value: '3',
      description: '1 point = 3 SAR value',
    },
    {
      key: 'points_expiry_days',
      value: '180',
      description: 'Points expire after 180 days (6 months)',
    },
  ];

  const createdConfigs: { [key: string]: any } = {};
  
  for (const config of configs) {
    const created = await prisma.configuration.upsert({
      where: { key: config.key },
      update: { value: config.value, description: config.description },
      create: config,
    });
    createdConfigs[config.key] = created;
  }

  console.log('✅ Configurations created');

  // Now create/update services with links to their earn rate configurations
  const carWash = await prisma.service.upsert({
    where: { name: 'Car Wash' },
    update: {
      usageType: 'both',
      earnRateId: createdConfigs['car_wash_earn_rate'].id,
    },
    create: {
      name: 'Car Wash',
      description: 'Professional car washing services',
      usageType: 'both',
      active: true,
      earnRateId: createdConfigs['car_wash_earn_rate'].id,
    },
  });

  const insurance = await prisma.service.upsert({
    where: { name: 'Insurance Premium' },
    update: {
      usageType: 'earn',
      earnRateId: createdConfigs['insurance_earn_rate'].id,
    },
    create: {
      name: 'Insurance Premium',
      description: 'Pay your insurance premium',
      usageType: 'earn',
      active: true,
      earnRateId: createdConfigs['insurance_earn_rate'].id,
    },
  });

  const carService = await prisma.service.upsert({
    where: { name: 'Car Service' },
    update: {
      usageType: 'both',
      earnRateId: createdConfigs['car_service_earn_rate'].id,
    },
    create: {
      name: 'Car Service',
      description: 'Regular car maintenance and service',
      usageType: 'both',
      active: true,
      earnRateId: createdConfigs['car_service_earn_rate'].id,
    },
  });

  console.log('✅ Services created with earn rate links:', carWash.name, insurance.name, carService.name);

  console.log('🎉 Database seed completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });

