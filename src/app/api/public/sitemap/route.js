import { NextResponse } from 'next/server';
import { validateApiKey } from '../../../../../lib/api-auth';
import prisma from '../../../../../lib/prisma';

// This public API returns JSON sitemap data for the authenticated domain via x-api-key
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req) {
    const auth = await validateApiKey(req);

    if (!auth.valid) {
        return NextResponse.json(
            { error: auth.error },
            { status: auth.status }
        );
    }

    try {
        const domainId = auth.domain.id;
        const userId = auth.domain.userId;

        const [posts, categories, tags] = await Promise.all([
            prisma.post.findMany({
                where: { domainId, status: 'PUBLISHED' },
                select: { slug: true, updatedAt: true, publishedAt: true },
                orderBy: { updatedAt: 'desc' },
                take: 2000,
            }),
            prisma.category.findMany({
                where: {
                    userId,
                    posts: { some: { domainId, status: 'PUBLISHED' } },
                },
                select: { slug: true, updatedAt: true },
                orderBy: { slug: 'asc' },
                take: 2000,
            }),
            prisma.tag.findMany({
                where: {
                    posts: { some: { domainId, status: 'PUBLISHED' } },
                },
                select: { slug: true },
                orderBy: { slug: 'asc' },
                take: 2000,
            }),
        ]);

        const payload = {
            baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
            generatedAt: new Date().toISOString(),
            counts: {
                posts: posts.length,
                categories: categories.length,
                tags: tags.length,
            },
            posts,
            categories,
            tags,
        };

        return NextResponse.json(payload, {
            headers: {
                // Always fresh for clients; they can revalidate client-side as needed
                'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
            },
        });
    } catch (error) {
        console.error('❌ Public sitemap JSON generation failed:', error);
        return NextResponse.json(
            { error: 'Failed to generate sitemap data' },
            { status: 500 }
        );
    }
}