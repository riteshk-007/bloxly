import { getPostsInternal, getCategoriesInternal } from '../../lib/blog-api';
import prisma from '../../lib/prisma';

// Make sitemap dynamic and refreshed periodically (avoid static at build time)
export const dynamic = 'force-dynamic';
export const revalidate = 60; // seconds

export default async function sitemap() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    try {
        // Server-side DB reads (no external fetch during build)
        const [postsData, categoriesResult, tags] = await Promise.all([
            getPostsInternal({ page: 1, limit: 1000 }),
            getCategoriesInternal(),
            prisma.tag.findMany({
                where: {
                    posts: {
                        some: { status: 'PUBLISHED' }
                    }
                },
                select: { slug: true }
            })
        ]);

        const urls = [
            // Main pages
            {
                url: baseUrl,
                lastModified: new Date(),
                changeFrequency: 'yearly',
                priority: 1,
            },
            {
                url: baseUrl + '/dashboard',
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.9,
            },
            {
                url: baseUrl + '/blog',
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 0.9,
            },
            // Auth pages
            {
                url: baseUrl + '/auth/signin',
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.6,
            },
        ];

        // Add individual blog posts
        if (postsData?.posts) {
            postsData.posts.forEach((post) => {
                urls.push({
                    url: `${baseUrl}/blog/${post.slug}`,
                    lastModified: new Date(post.updatedAt),
                    changeFrequency: 'weekly',
                    priority: 0.8,
                });
            });
        }

        // Add category pages
        const categories = categoriesResult?.categories || []
        if (categories.length) {
            categories.forEach((category) => {
                urls.push({
                    url: `${baseUrl}/blog/category/${category.slug}`,
                    lastModified: new Date(),
                    changeFrequency: 'weekly',
                    priority: 0.7,
                });
            });
        }

        // Add tag pages
        if (tags?.length) {
            tags.forEach((tag) => {
                urls.push({
                    url: `${baseUrl}/blog/tag/${tag.slug}`,
                    lastModified: new Date(),
                    changeFrequency: 'weekly',
                    priority: 0.6,
                })
            })
        }

        // Tags optional; if you later need tags, fetch via API layer to avoid coupling

        return urls;

    } catch (error) {
        console.error('Error generating sitemap:', error);

        // Fallback to basic sitemap if database queries fail
        return [
            {
                url: baseUrl,
                lastModified: new Date(),
                changeFrequency: 'yearly',
                priority: 1,
            },
            {
                url: baseUrl + '/dashboard',
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.9,
            },
            {
                url: baseUrl + '/blog',
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 0.9,
            },
        ];
    }
}