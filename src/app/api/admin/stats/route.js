import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '../../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.role || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get basic stats
        const [totalUsers, totalDomains, totalPosts, activeSubscriptions] = await Promise.all([
            prisma.user.count(),
            prisma.domain.count(),
            prisma.post.count(),
            prisma.subscription.count({
                where: {
                    status: 'ACTIVE',
                    endDate: {
                        gte: new Date()
                    }
                }
            })
        ]);

        // Get recent activity (last 5 users created)
        const recentUsers = await prisma.user.findMany({
            take: 5,
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                email: true,
                createdAt: true,
                role: true
            }
        });

        const recentActivity = recentUsers.map(user => ({
            description: `New ${user.role.toLowerCase()} registered: ${user.email}`,
            time: user.createdAt.toLocaleDateString()
        }));

        const stats = {
            totalUsers,
            totalDomains,
            totalPosts,
            activeSubscriptions,
            recentActivity
        };

        return NextResponse.json(stats);

    } catch (error) {
        console.error('Admin stats error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch admin stats' },
            { status: 500 }
        );
    }
}