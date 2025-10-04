import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function cleanupDatabase() {
    try {
        console.log('🧹 Cleaning up database...');

        // First, get all valid user IDs
        const validUsers = await prisma.user.findMany({
            select: { id: true, email: true }
        });

        console.log('📋 Valid users:', validUsers);

        const validUserIds = validUsers.map(u => u.id);

        // Delete subscriptions that don't have valid userIds
        const invalidSubscriptions = await prisma.subscription.findMany({
            where: {
                userId: {
                    notIn: validUserIds
                }
            }
        });

        console.log('🗑️ Found invalid subscriptions:', invalidSubscriptions.length);

        if (invalidSubscriptions.length > 0) {
            await prisma.subscription.deleteMany({
                where: {
                    userId: {
                        notIn: validUserIds
                    }
                }
            });
            console.log('✅ Deleted invalid subscriptions');
        }

        // Create default FREE subscriptions for users who don't have one
        for (const user of validUsers) {
            const existingSubscription = await prisma.subscription.findUnique({
                where: { userId: user.id }
            });

            if (!existingSubscription) {
                await prisma.subscription.create({
                    data: {
                        userId: user.id,
                        plan: 'FREE',
                        status: 'ACTIVE',
                        maxDomains: 1,
                        maxBlogs: 5,
                        startDate: new Date(),
                        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
                    }
                });
                console.log(`✅ Created FREE subscription for user: ${user.email}`);
            } else {
                console.log(`ℹ️ Subscription already exists for user: ${user.email}`);
            }
        }

        console.log('🎉 Database cleanup completed!');

        // Show final state
        const finalUsers = await prisma.user.count();
        const finalSubscriptions = await prisma.subscription.count();

        console.log(`📊 Final state: ${finalUsers} users, ${finalSubscriptions} subscriptions`);

    } catch (error) {
        console.error('❌ Error during cleanup:', error);
    } finally {
        await prisma.$disconnect();
    }
}

cleanupDatabase();