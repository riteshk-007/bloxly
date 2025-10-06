import { NextResponse } from 'next/server';
import { validateApiKey } from '../../../../../lib/api-auth';
import prisma from '../../../../../lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req) {
    const auth = await validateApiKey(req);
    if (!auth.valid) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    try {
        const url = new URL(req.url);
        const limit = Math.max(1, Math.min(50, parseInt(url.searchParams.get('limit') || '5', 10)));
        const sort = url.searchParams.get('sort') || 'mix';
        const domainId = auth.domain.id;

        const select = {
            id: true,
            title: true,
            excerpt: true,
            slug: true,
            views: true,
            publishedAt: true,
            featuredImage: true,
        };

        let posts = [];

        if (sort === 'newest') {
            posts = await prisma.post.findMany({
                where: { domainId, status: 'PUBLISHED' },
                orderBy: { createdAt: 'desc' },
                take: limit,
                select,
            });
        } else if (sort === 'popular') {
            posts = await prisma.post.findMany({
                where: { domainId, status: 'PUBLISHED' },
                orderBy: { views: 'desc' },
                take: limit,
                select,
            });
        } else {
            // mix: first N newest (default 3), then fill with popular older posts
            const newestCount = Math.min(3, limit);
            const popularCount = Math.max(0, limit - newestCount);

            const newest = await prisma.post.findMany({
                where: { domainId, status: 'PUBLISHED' },
                orderBy: { createdAt: 'desc' },
                take: newestCount,
                select,
            });

            let popular = [];
            if (popularCount > 0) {
                const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                popular = await prisma.post.findMany({
                    where: { domainId, status: 'PUBLISHED', createdAt: { lt: sevenDaysAgo } },
                    orderBy: { views: 'desc' },
                    take: popularCount * 3, // fetch extra to avoid duplicates
                    select,
                });
                const newestSlugs = new Set(newest.map((p) => p.slug));
                popular = popular.filter((p) => !newestSlugs.has(p.slug)).slice(0, popularCount);
            }

            posts = [...newest, ...popular];
        }

        return NextResponse.json(posts, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
                'Vary': 'x-api-key',
            },
        });
    } catch (error) {
        console.error('Highlights fetch failed:', error);
        return NextResponse.json({ error: 'Failed to fetch highlights' }, { status: 500 });
    }
}
