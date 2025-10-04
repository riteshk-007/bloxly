// Blog data helpers for both external (public API) and internal (server) use
// When server-side, we read directly via Prisma (no API key required)
// When client-side, we call the public API with NEXT_PUBLIC_BLOG_API_KEY

import prisma from './prisma';
import { normalizePublicUrl } from './r2';

const API_BASE_URL = process.env.NEXT_PUBLIC_BLOG_API_URL || 'http://localhost:3000';
const API_KEY = process.env.NEXT_PUBLIC_BLOG_API_KEY;

async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}/api/public${endpoint}`;

    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY,
            ...options.headers,
        },
        ...options,
    });

    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
    }

    return response.json();
}

export async function getPosts({ page = 1, limit = 10, category = null, search = null } = {}) {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });

    if (category) params.append('category', category);
    if (search) params.append('search', search);

    return apiRequest(`/posts?${params}`);
}

export async function getPost(slug) {
    // Server-side: query DB directly to avoid API key/domain setup blocking the app
    if (typeof window === 'undefined') {
        try {
            const post = await prisma.post.findFirst({
                where: { slug, status: 'PUBLISHED' },
                include: { category: true, tags: true, domain: true },
            });

            if (!post) return Promise.reject(new Error('Post not found'));

            const relatedPosts = await prisma.post.findMany({
                where: {
                    id: { not: post.id },
                    status: 'PUBLISHED',
                    OR: [
                        { categoryId: post.categoryId || undefined },
                        {
                            tags: {
                                some: { id: { in: post.tags.map(t => t.id) } },
                            },
                        },
                    ],
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
                },
            });

            // Normalize image URLs for R2 public host
            const normalizedPost = {
                ...post,
                featuredImage: post.featuredImage ? normalizePublicUrl(post.featuredImage) : null,
                images: Array.isArray(post.images) ? post.images.map(normalizePublicUrl) : [],
            };
            const normalizedRelated = relatedPosts.map(rp => ({
                ...rp,
                featuredImage: rp?.featuredImage ? normalizePublicUrl(rp.featuredImage) : null,
            }));

            return { post: normalizedPost, relatedPosts: normalizedRelated };
        } catch (e) {
            // Fall through to client flow if anything goes wrong
        }
    }

    // Client-side: use the public API (requires NEXT_PUBLIC_BLOG_API_KEY and domain)
    return apiRequest(`/posts/${slug}`);
}

export async function getCategories() {
    return apiRequest('/categories');
}

export async function getRelatedPosts(postId, limit = 5) {
    return apiRequest(`/posts/${postId}/related?limit=${limit}`);
}

// For internal use (when running on the same server)
export async function getPostsInternal({ page = 1, limit = 10, category = null, search = null } = {}) {
    if (typeof window !== 'undefined') {
        // Client-side: use API
        return getPosts({ page, limit, category, search });
    }

    // Server-side: use direct database access
    try {

        const where = {
            status: 'PUBLISHED',
        };

        if (category) {
            where.category = {
                slug: category,
            };
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
                { excerpt: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [postsRaw, total] = await Promise.all([
            prisma.post.findMany({
                where,
                include: {
                    category: true,
                    tags: true,
                    domain: {
                        include: {
                            user: {
                                select: {
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.post.count({ where }),
        ]);

        const posts = postsRaw.map((p) => ({
            ...p,
            featuredImage: p?.featuredImage ? normalizePublicUrl(p.featuredImage) : null,
            images: Array.isArray(p?.images) ? p.images.map((u) => normalizePublicUrl(u)) : [],
        }));

        return {
            posts,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    } catch (error) {
        console.error('Database query failed:', error);
        return { posts: [], pagination: { page: 1, limit, total: 0, pages: 0 } };
    }
}

export async function getCategoriesInternal() {
    if (typeof window !== 'undefined') {
        return getCategories();
    }

    try {


        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: {
                        posts: {
                            where: {
                                status: 'PUBLISHED',
                            },
                        },
                    },
                },
            },
            orderBy: { name: 'asc' },
        });

        return { categories };
    } catch (error) {
        console.error('Database query failed:', error);
        return { categories: [] };
    }
}