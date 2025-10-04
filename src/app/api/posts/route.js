import { NextResponse } from 'next/server';
import slugify from 'slug';
import prisma from '../../../../lib/prisma';
import { normalizePublicUrl } from '../../../../lib/r2';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const domainId = searchParams.get('domainId');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        const where = {
            ...(domainId && { domainId }),
            // Only show posts from user's domains
            domain: {
                userId: session.user.id
            }
        };

        const [posts, total] = await Promise.all([
            prisma.post.findMany({
                where,
                include: {
                    category: true,
                    tags: true,
                    domain: {
                        select: { domain: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.post.count({ where }),
        ]);

        const normalizedPosts = posts.map(p => ({
            ...p,
            featuredImage: p.featuredImage ? normalizePublicUrl(p.featuredImage) : null,
            images: Array.isArray(p.images) ? p.images.map(normalizePublicUrl) : [],
        }));

        return NextResponse.json({
            posts: normalizedPosts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch posts' },
            { status: 500 }
        );
    }
}

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const {
            title,
            content,
            excerpt,
            categoryId,
            tags,
            tagIds,
            images,
            featuredImage,
            metaTitle,
            metaDescription,
            keywords,
            domainId,
            status = 'DRAFT'
        } = await req.json();

        // Verify domain belongs to user
        const domain = await prisma.domain.findFirst({
            where: {
                id: domainId,
                userId: session.user.id
            },
            include: {
                user: {
                    include: { subscription: true }
                },
                _count: {
                    select: { posts: true }
                }
            }
        });

        if (!domain) {
            return NextResponse.json(
                { error: 'Domain not found or unauthorized' },
                { status: 404 }
            );
        }

        // Check blog limits
        const subscription = domain.user.subscription;

        // If no subscription exists, create a default FREE subscription
        if (!subscription) {
            await prisma.subscription.create({
                data: {
                    userId: session.user.id,
                    planType: 'FREE',
                    status: 'ACTIVE',
                    domainsAllowed: 1,
                    blogsPerDomain: 5,
                    currentDomains: 0,
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
                }
            });

            // Reload domain with new subscription
            const updatedDomain = await prisma.domain.findFirst({
                where: { id: domainId },
                include: {
                    user: { include: { subscription: true } },
                    _count: { select: { posts: true } }
                }
            });

            const newSubscription = updatedDomain.user.subscription;
            if (domain._count.posts >= newSubscription.blogsPerDomain) {
                return NextResponse.json(
                    { error: 'Blog limit exceeded for this domain' },
                    { status: 403 }
                );
            }
        } else {
            // Check existing subscription limits
            if (domain._count.posts >= subscription.blogsPerDomain) {
                return NextResponse.json(
                    { error: 'Blog limit exceeded for this domain' },
                    { status: 403 }
                );
            }
        }

        const slug = slugify(title, { lower: true });

        // Validate category belongs to user (if provided)
        let validCategoryId = null;
        if (categoryId) {
            const cat = await prisma.category.findFirst({ where: { id: categoryId, userId: session.user.id }, select: { id: true } });
            if (!cat) {
                return NextResponse.json({ error: 'Invalid category. Please select a category you created.' }, { status: 400 });
            }
            validCategoryId = cat.id;
        }

        // Check for duplicate slug within domain
        const existingPost = await prisma.post.findFirst({
            where: { slug, domainId }
        });

        if (existingPost) {
            return NextResponse.json(
                { error: 'A post with this title already exists in this domain' },
                { status: 409 }
            );
        }

        // Handle tags: either from tags array (name objects) or tagIds (existing tag IDs)
        let tagConnection = {};

        if (tags && Array.isArray(tags) && tags.length > 0) {
            // Support for tags with names (either just name property or objects with name property)
            tagConnection = {
                connectOrCreate: tags.map(tag => {
                    const tagName = typeof tag === 'string' ? tag : tag.name;
                    return {
                        where: {
                            slug_userId: {
                                slug: slugify(tagName, { lower: true }),
                                userId: session.user.id
                            }
                        },
                        create: {
                            name: tagName,
                            slug: slugify(tagName, { lower: true }),
                            userId: session.user.id
                        }
                    };
                })
            };
        } else if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
            // Get tag names from tagIds to create connectOrCreate
            const existingTags = await prisma.tag.findMany({
                where: {
                    id: { in: tagIds },
                    userId: session.user.id // Ensure user owns these tags
                },
                select: { id: true, name: true, slug: true }
            });

            tagConnection = {
                connectOrCreate: existingTags.map(tag => ({
                    where: {
                        slug_userId: {
                            slug: tag.slug,
                            userId: session.user.id
                        }
                    },
                    create: {
                        name: tag.name,
                        slug: tag.slug,
                        userId: session.user.id
                    }
                }))
            };
        }

        // Fallback meta description from excerpt or first 160 chars of content (stripped)
        const deriveMeta = (str) => (str || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
        const computedMetaDescription = (metaDescription && metaDescription.trim())
            ? metaDescription.trim().slice(0, 160)
            : (excerpt && excerpt.trim())
                ? deriveMeta(excerpt).slice(0, 160)
                : deriveMeta(content).slice(0, 160);

        const post = await prisma.post.create({
            data: {
                title,
                slug,
                content,
                excerpt,
                categoryId: validCategoryId,
                images: Array.isArray(images) ? images : [],
                featuredImage,
                metaTitle,
                metaDescription: computedMetaDescription,
                keywords: keywords || [],
                domainId,
                status,
                author: session.user.name || 'User',
                ...(status === 'PUBLISHED' && { publishedAt: new Date() }),
                ...(Object.keys(tagConnection).length > 0 && { tags: tagConnection })
            },
            include: {
                category: true,
                tags: true,
                domain: {
                    select: { domain: true }
                }
            }
        });

        revalidatePath('/sitemap.js');

        return NextResponse.json(post, { status: 201 });
    } catch (error) {
        console.error('Post creation error:', error);
        const msg = error?.code === 'P2003' && error?.meta?.constraint?.includes('categoryId')
            ? 'Invalid category selected. Please choose a valid category.'
            : 'Failed to create post';
        return NextResponse.json({ error: msg, detail: error?.message }, { status: 500 });
    }
}