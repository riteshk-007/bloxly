const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Create a test user
    const hashedPassword = await bcrypt.hash('test123', 12);

    const user = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
      },
    });

    console.log('Test user created/updated:', user);

    // Create another test user
    const hashedPassword2 = await bcrypt.hash('test123', 12);

    const user2 = await prisma.user.upsert({
      where: { email: 'user2@example.com' },
      update: {},
      create: {
        email: 'user2@example.com',
        password: hashedPassword2,
        name: 'Test User 2',
      },
    });

    console.log('Second test user created/updated:', user2);

  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();