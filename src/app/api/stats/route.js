import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import prisma from '../../../../lib/prisma';

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Get user's domains
        const userDomains = await prisma.domain.findMany({
            where: { userId: session.user.id },
            select: { id: true }
        });

        const domainIds = userDomains.map(domain => domain.id);

        // Get stats
        const totalPosts = await prisma.post.count({
            where: { domainId: { in: domainIds } }
        });

        const publishedPosts = await prisma.post.count({
            where: {
                domainId: { in: domainIds },
                status: 'PUBLISHED'
            }
        });

        const totalViewsResult = await prisma.post.aggregate({
            where: { domainId: { in: domainIds } },
            _sum: { views: true }
        });

        const totalViews = totalViewsResult._sum.views || 0;

        // Get recent posts
        const recentPosts = await prisma.post.findMany({
            where: { domainId: { in: domainIds } },
            include: {
                domain: {
                    select: { domain: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        return NextResponse.json({
            totalPosts,
            publishedPosts,
            totalViews,
            totalDomains: userDomains.length,
            recentPosts
        });

    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch stats' },
            { status: 500 }
        );
    }
}