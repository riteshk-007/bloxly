import { NextResponse } from 'next/server';
import { validateApiKey } from '../../../../../../lib/api-auth';
import prisma from '../../../../../../lib/prisma';
import { normalizePublicUrl } from '../../../../../../lib/r2';

export const dynamic = 'force-dynamic';
export const revalidate = 0;


export async function GET(
    req,
    { params }
) {
    const auth = await validateApiKey(req);

    if (!auth.valid) {
        return NextResponse.json(
            { error: auth.error },
            { status: auth.status }
        );
    }

    try {
        const post = await prisma.post.findFirst({
            where: {
                slug: params.slug,
                status: 'PUBLISHED',
                domainId: auth.domain.id, // Filter by domain
            },
            include: {
                category: true,
                tags: true,
            },
        });

        if (!post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            );
        }

        // Normalize public URLs to match current R2 host/path style
        const normalizedPost = {
            ...post,
            featuredImage: post?.featuredImage ? normalizePublicUrl(post.featuredImage) : null,
            images: Array.isArray(post?.images) ? post.images.map(normalizePublicUrl) : [],
        };

        // Get related posts from same domain
        const relatedPosts = await prisma.post.findMany({
            where: {
                id: { not: post.id },
                status: 'PUBLISHED',
                domainId: auth.domain.id,
                OR: [
                    { categoryId: post.categoryId },
                    {
                        tags: {
                            some: {
                                id: { in: post.tags.map(t => t.id) }
                            }
                        }
                    }
                ]
            },
            take: 3,
            orderBy: { views: 'desc' },
            select: {
                id: true,
                title: true,
                slug: true,
                excerpt: true,
                featuredImage: true,
                publishedAt: true,
                category: true,
            }
        });

        // Increment view count
        await prisma.post.update({
            where: { id: post.id },
            data: { views: { increment: 1 } }
        });

        // Normalize related posts images too
        const normalizedRelated = relatedPosts.map(rp => ({
            ...rp,
            featuredImage: rp?.featuredImage ? normalizePublicUrl(rp.featuredImage) : null,
        }));

        return NextResponse.json({
            post: normalizedPost,
            relatedPosts: normalizedRelated,
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
                'Vary': 'x-api-key',
            }
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch post' },
            { status: 500 }
        );
    }
}
