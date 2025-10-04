import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '../../../../../lib/prisma';
import { deleteR2ObjectByKey, keyFromPublicUrl, normalizePublicUrl } from '../../../../../lib/r2';
import { revalidatePath } from 'next/cache';

import { authOptions } from '../../auth/[...nextauth]/route';
function extractImageUrls(html) {
    if (!html || typeof html !== 'string') return [];
    const urls = new Set();
    const imgRe = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let m;
    while ((m = imgRe.exec(html)) !== null) {
        if (m[1]) urls.add(m[1]);
    }
    return Array.from(urls);
}

export async function GET(req, { params }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const post = await prisma.post.findFirst({
            where: {
                id: params.id,
                domain: {
                    userId: session.user.id // Ensure user owns the domain
                }
            },
            include: { category: true, tags: true },
        });

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        const normalized = {
            ...post,
            featuredImage: post.featuredImage ? normalizePublicUrl(post.featuredImage) : null,
            images: Array.isArray(post.images) ? post.images.map(normalizePublicUrl) : [],
        };
        return NextResponse.json(normalized);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();

        const images = Array.isArray(body.images) ? body.images : [];
        const keywords = Array.isArray(body.keywords) ? body.keywords : [];
        const tagIds = Array.isArray(body.tagIds) ? body.tagIds.filter(Boolean) : [];
        const tags = Array.isArray(body.tags) ? body.tags : [];

        const data = {
            title: body.title,
            content: body.content,
            excerpt: body.excerpt,
            featuredImage: body.featuredImage || null,
            images,
            status: body.status,
            metaTitle: body.metaTitle || null,
            metaDescription: body.metaDescription || null,
            keywords,
            publishedAt: body.status === 'PUBLISHED' && !body.publishedAt ? new Date() : body.publishedAt,
        };

        if (body.categoryId) {
            const cat = await prisma.category.findUnique({
                where: {
                    id: body.categoryId,
                    userId: session.user.id // Ensure user owns this category
                }
            });
            if (cat) {
                data.categoryId = body.categoryId;
            } else {
                console.warn('Ignored invalid categoryId on update:', body.categoryId);
            }
        }

        // Handle tags: support both tags array (from edit page) and tagIds array (from other sources)
        if (tags.length > 0) {
            // Convert tags to connectOrCreate format like in POST endpoint
            data.tags = {
                set: [], // Clear existing tags first
                connectOrCreate: tags.map(tag => {
                    const tagName = typeof tag === 'string' ? tag : tag.name;
                    return {
                        where: {
                            slug_userId: {
                                slug: tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                                userId: session.user.id
                            }
                        },
                        create: {
                            name: tagName,
                            slug: tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                            userId: session.user.id
                        }
                    };
                })
            };
        } else if (tagIds.length > 0) {
            // only keep tagIds that exist in the database and belong to the user
            const existingTags = await prisma.tag.findMany({
                where: {
                    id: { in: tagIds },
                    userId: session.user.id // Ensure user owns these tags
                },
                select: { id: true }
            });
            const existingTagIds = existingTags.map(t => t.id);
            if (existingTagIds.length > 0) {
                data.tags = { set: existingTagIds.map((id) => ({ id })) };
            }
        }

        // ensure post exists and user owns it
        const existing = await prisma.post.findFirst({
            where: {
                id: params.id,
                domain: {
                    userId: session.user.id // Ensure user owns the domain
                }
            }
        });
        if (!existing) {
            return NextResponse.json({ error: 'Post not found or unauthorized' }, { status: 404 });
        }

        // If featured image is being replaced/cleared, try to delete previous R2 object (best-effort)
        const shouldReplaceFeatured = typeof body.featuredImage !== 'undefined';
        let previousFeaturedUrl = null;
        if (shouldReplaceFeatured && existing?.featuredImage && existing.featuredImage !== body.featuredImage) {
            previousFeaturedUrl = existing.featuredImage;
        }

        const post = await prisma.post.update({
            where: { id: params.id },
            data,
            include: { category: true, tags: true },
        });

        // Best-effort delete of old featured image in R2
        if (previousFeaturedUrl) {
            const key = keyFromPublicUrl(previousFeaturedUrl);
            if (key) await deleteR2ObjectByKey(key);
            try {
                if (key) {
                    await prisma.image.deleteMany({ where: { key } });
                } else {
                    await prisma.image.deleteMany({ where: { url: previousFeaturedUrl } });
                }
            } catch { /* ignore */ }
        }

        // Best-effort delete of any images removed from the post.images array
        try {
            const newImages = Array.isArray(images) ? images : [];
            const removed = Array.isArray(existing?.images)
                ? existing.images.filter((u) => !newImages.includes(u))
                : [];
            for (const url of removed) {
                const key = keyFromPublicUrl(url);
                if (key) await deleteR2ObjectByKey(key);
                try {
                    if (key) {
                        await prisma.image.deleteMany({ where: { key } });
                    } else {
                        await prisma.image.deleteMany({ where: { url } });
                    }
                } catch { /* ignore */ }
            }
            // Also compare images embedded in content
            const beforeUrls = extractImageUrls(existing?.content);
            const afterUrls = extractImageUrls(body?.content);
            const removedFromContent = beforeUrls.filter((u) => !afterUrls.includes(u));
            for (const url of removedFromContent) {
                const key = keyFromPublicUrl(url);
                if (key) await deleteR2ObjectByKey(key);
                try {
                    if (key) await prisma.image.deleteMany({ where: { key } });
                    else await prisma.image.deleteMany({ where: { url } });
                } catch { /* ignore */ }
            }
        } catch { /* ignore */ }
        revalidatePath('/sitemap.js');
        return NextResponse.json(post);
    } catch (error) {
        // Log full error for debugging in dev
        console.error('Error updating post', error);
        return NextResponse.json({ error: 'Failed to update post', detail: error?.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Ensure post exists and user owns it
        const existing = await prisma.post.findFirst({
            where: {
                id: params.id,
                domain: {
                    userId: session.user.id // Ensure user owns the domain
                }
            }
        });
        if (!existing) {
            return NextResponse.json({ error: 'Post not found or unauthorized' }, { status: 404 });
        }

        // Capture urls before delete
        const featuredUrl = existing.featuredImage || null;
        const imageUrls = Array.isArray(existing.images) ? existing.images : [];
        const contentUrls = extractImageUrls(existing?.content);
        await prisma.post.delete({ where: { id: params.id } });

        // Best-effort: delete featured image and any post.images from R2 if they belong to our bucket
        try {
            if (featuredUrl) {
                const key = keyFromPublicUrl(featuredUrl);
                if (key) await deleteR2ObjectByKey(key);
                try {
                    if (key) await prisma.image.deleteMany({ where: { key } });
                    else await prisma.image.deleteMany({ where: { url: featuredUrl } });
                } catch { /* ignore */ }
            }
            const toDelete = Array.from(new Set([...(imageUrls || []), ...(contentUrls || [])]));
            for (const url of toDelete) {
                const key = keyFromPublicUrl(url);
                if (key) await deleteR2ObjectByKey(key);
                try {
                    if (key) await prisma.image.deleteMany({ where: { key } });
                    else await prisma.image.deleteMany({ where: { url } });
                } catch { /* ignore */ }
            }
        } catch { /* ignore */ }
        revalidatePath('/sitemap.js');
        return NextResponse.json({ message: 'Post deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
    }
}