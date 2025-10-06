import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { validateApiKey } from '../../../../../lib/api-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req) {
    // Validate API key
    const auth = await validateApiKey(req);

    if (!auth.valid) {
        return NextResponse.json(
            { error: auth.error },
            { status: auth.status }
        );
    }

    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const category = searchParams.get('category');
        const tag = searchParams.get('tag');
        const skip = (page - 1) * limit;

        const where = {
            status: 'PUBLISHED',
            domainId: auth.domain.id, // Filter by domain
            ...(category && { category: { slug: category } }),
            ...(tag && { tags: { some: { slug: tag } } }),
        };

        const [posts, total] = await Promise.all([
            prisma.post.findMany({
                where,
                include: {
                    category: true,
                    tags: true,
                },
                orderBy: { publishedAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.post.count({ where }),
        ]);

        return NextResponse.json({
            posts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
                'Vary': 'x-api-key',
            }
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch posts' },
            { status: 500 }
        );
    }
}