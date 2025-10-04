const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestAccounts() {
    try {
        console.log('Creating test accounts...');

        // Create admin user
        const hashedPassword = await bcrypt.hash('admin123', 12);

        const adminUser = await prisma.user.upsert({
            where: { email: 'admin@myblog.com' },
            update: {},
            create: {
                email: 'admin@myblog.com',
                name: 'Admin User',
                password: hashedPassword,
                role: 'ADMIN',
            },
        });

        console.log('✅ Admin user created:', adminUser.email);

        // Create regular test user
        const testUser = await prisma.user.upsert({
            where: { email: 'user@test.com' },
            update: {},
            create: {
                email: 'user@test.com',
                name: 'Test User',
                role: 'USER',
            },
        });

        console.log('✅ Test user created:', testUser.email);

        // Create subscription for test user
        const subscription = await prisma.subscription.upsert({
            where: { userId: testUser.id },
            update: {},
            create: {
                userId: testUser.id,
                planType: 'FREE',
                status: 'ACTIVE',
                domainsAllowed: 1,
                blogsPerDomain: 5,
                endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
            },
        });

        console.log('✅ Free subscription created for test user');

        // Create a test domain for the user
        const domain = await prisma.domain.upsert({
            where: { domain: 'localhost' },
            update: {},
            create: {
                domain: 'localhost',
                apiKey: 'dev-api-key-12345',
                isActive: true,
                rateLimit: 1000, // Higher limit for dev
                description: 'Development domain',
                userId: testUser.id,
            },
        });

        console.log('✅ Test domain created:', domain.domain);

        console.log('\n🎉 Test accounts created successfully!');
        console.log('\nLogin credentials:');
        console.log('Admin: admin@myblog.com / admin123');
        console.log('User: user@test.com (Google OAuth only)');
        console.log('Dev API Key: dev-api-key-12345');

    } catch (error) {
        console.error('Error creating test accounts:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

createTestAccounts();