import { NextResponse } from 'next/server';
import { validateApiKey } from '../../../../../lib/api-auth';
import prisma from '../../../../../lib/prisma';


export async function GET(req) {
    const auth = await validateApiKey(req);

    if (!auth.valid) {
        return NextResponse.json(
            { error: auth.error },
            { status: auth.status }
        );
    }

    try {
        const posts = await prisma.post.findMany({
            where: { status: 'PUBLISHED' },
            select: {
                slug: true,
                updatedAt: true,
                publishedAt: true,
            },
            orderBy: { publishedAt: 'desc' }
        });

        const categories = await prisma.category.findMany({
            select: {
                slug: true,
                updatedAt: true,
            }
        });

        return NextResponse.json({
            posts,
            categories,
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
            }
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch sitemap data' },
            { status: 500 }
        );
    }
}