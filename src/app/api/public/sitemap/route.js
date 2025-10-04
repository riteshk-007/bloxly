// CREATE NEW FILE: src/app/sitemap.xml/route.js

import { NextResponse } from 'next/server';
import { getCategoriesInternal, getPostsInternal } from '../../../../../lib/blog-api';

// ✅ CRITICAL: Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    console.log('🔄 Generating sitemap dynamically...');

    try {
        // Fetch fresh data from database
        const [postsData, categoriesData] = await Promise.all([
            getPostsInternal({ page: 1, limit: 1000 }),
            getCategoriesInternal(),
        ]);

        const urls = [];

        // Static pages
        const staticPages = [
            { url: baseUrl, priority: '1.0', changefreq: 'yearly' },
            { url: `${baseUrl}/blog`, priority: '0.9', changefreq: 'daily' },
            { url: `${baseUrl}/dashboard`, priority: '0.9', changefreq: 'monthly' },
            { url: `${baseUrl}/auth/signin`, priority: '0.6', changefreq: 'monthly' },
        ];

        staticPages.forEach(page => {
            urls.push({
                loc: page.url,
                lastmod: new Date().toISOString(),
                changefreq: page.changefreq,
                priority: page.priority,
            });
        });

        // Add blog posts
        let postCount = 0;
        if (postsData?.posts && Array.isArray(postsData.posts)) {
            postsData.posts.forEach((post) => {
                urls.push({
                    loc: `${baseUrl}/blog/${post.slug}`,
                    lastmod: new Date(post.updatedAt || post.publishedAt).toISOString(),
                    changefreq: 'weekly',
                    priority: '0.8',
                });
                postCount++;
            });
        }

        // Add categories
        let categoryCount = 0;
        if (categoriesData?.categories && Array.isArray(categoriesData.categories)) {
            categoriesData.categories.forEach((category) => {
                urls.push({
                    loc: `${baseUrl}/blog/category/${category.slug}`,
                    lastmod: new Date().toISOString(),
                    changefreq: 'weekly',
                    priority: '0.7',
                });
                categoryCount++;
            });
        }

        console.log(`✅ Sitemap generated: ${urls.length} total URLs (${postCount} posts, ${categoryCount} categories)`);

        // Generate XML
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

        return new NextResponse(sitemap, {
            status: 200,
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                // NO CACHING - always fresh
                'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
            },
        });

    } catch (error) {
        console.error('❌ Sitemap generation failed:', error);

        // Minimal fallback
        const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;

        return new NextResponse(fallbackSitemap, {
            status: 200,
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
            },
        });
    }
}