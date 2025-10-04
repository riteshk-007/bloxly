# Blog API Integration Guide

This guide shows you how to integrate the Multi-Domain Blog Management System into your existing website to display dynamic blog content.

## 🎯 What You Get

- **Dynamic Blog Content**: Fetch posts, categories, and related content via API
- **SEO Optimized**: WordPress-level SEO with structured data and meta tags
- **Fast Performance**: Cached responses with revalidation
- **Easy Integration**: Simple JavaScript API client

## 🚀 Quick Start

### Step 1: Get Your API Credentials

1. **Register Your Domain**:
   - Visit the blog management dashboard
   - Sign up with Google OAuth
   - Add your domain (e.g., `myblog.com`)
   - Copy your unique API key

2. **Choose Your Plan**:
   - **Free**: 1 domain, 5 blogs
   - **Paid (₹49/month)**: 3 domains, 20 blogs each

### Step 2: Install the Blog API Client

Copy the `blog-api.js` file to your project:

```javascript
// lib/blog-api.js
const BLOG_API_URL = process.env.NEXT_PUBLIC_BLOG_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_BLOG_API_KEY;

async function blogFetch(endpoint, options = {}) {
    if (!BLOG_API_URL || !API_KEY) {
        throw new Error('Blog API credentials not configured');
    }

    const response = await fetch(`${BLOG_API_URL}${endpoint}`, {
        ...options,
        headers: {
            'x-api-key': API_KEY,
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
}

export async function getPosts(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.category) queryParams.append('category', params.category);
    if (params.tag) queryParams.append('tag', params.tag);

    return blogFetch(`/api/public/posts?${queryParams}`, {
        next: { revalidate: 60 }
    });
}

export async function getPost(slug) {
    return blogFetch(`/api/public/posts/${slug}`, {
        next: { revalidate: 300 }
    });
}

export async function getCategories() {
    return blogFetch('/api/public/categories', {
        next: { revalidate: 600 }
    });
}

export async function getSitemapData() {
    return blogFetch('/api/public/sitemap', {
        next: { revalidate: 3600 }
    });
}
```

### Step 3: Configure Environment Variables

Add to your `.env.local`:

```bash
# Replace with your actual API URL and key
NEXT_PUBLIC_BLOG_API_URL=https://your-blog-management-system.com
NEXT_PUBLIC_BLOG_API_KEY=blog_your_unique_api_key_here
```

## 📖 Usage Examples

### Display Blog Posts (Next.js)

```javascript
// pages/blog/index.js or app/blog/page.js
import { getPosts, getCategories } from '../../lib/blog-api';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';

export default async function BlogPage({ searchParams }) {
    const page = parseInt(searchParams.page || '1');
    const category = searchParams.category;

    const [postsData, categoriesData] = await Promise.all([
        getPosts({ page, limit: 12, category }),
        getCategories(),
    ]);

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            {/* Categories Filter */}
            <div className="mb-8 flex flex-wrap gap-3">
                <Link
                    href="/blog"
                    className={`px-4 py-2 rounded-full ${!category
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border hover:border-blue-600'
                    }`}
                >
                    All Posts
                </Link>
                {categoriesData.categories.map((cat) => (
                    <Link
                        key={cat.id}
                        href={`/blog?category=${cat.slug}`}
                        className={`px-4 py-2 rounded-full ${category === cat.slug
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border hover:border-blue-600'
                        }`}
                    >
                        {cat.name} ({cat._count.posts})
                    </Link>
                ))}
            </div>

            {/* Posts Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {postsData.posts.map((post) => (
                    <Link
                        key={post.id}
                        href={`/blog/${post.slug}`}
                        className="group"
                    >
                        <article className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
                            {post.featuredImage && (
                                <div className="relative h-48">
                                    <Image
                                        src={post.featuredImage}
                                        alt={post.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition"
                                    />
                                </div>
                            )}
                            <div className="p-6">
                                {post.category && (
                                    <span className="text-blue-600 text-sm font-semibold">
                                        {post.category.name}
                                    </span>
                                )}
                                <h2 className="text-xl font-bold mb-2 group-hover:text-blue-600">
                                    {post.title}
                                </h2>
                                <p className="text-gray-600 mb-4 line-clamp-2">
                                    {post.excerpt}
                                </p>
                                <div className="flex items-center justify-between text-sm text-gray-500">
                                    <span>
                                        {format(new Date(post.publishedAt), 'MMM dd, yyyy')}
                                    </span>
                                    <span>{post.views} views</span>
                                </div>
                            </div>
                        </article>
                    </Link>
                ))}
            </div>

            {/* Pagination */}
            {postsData.pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    {Array.from({ length: postsData.pagination.totalPages }, (_, i) => (
                        <Link
                            key={i + 1}
                            href={`/blog?page=${i + 1}${category ? `&category=${category}` : ''}`}
                            className={`px-4 py-2 rounded-lg ${page === i + 1
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border hover:border-blue-600'
                            }`}
                        >
                            {i + 1}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
```

### Single Blog Post Page

```javascript
// pages/blog/[slug].js or app/blog/[slug]/page.js
import { getPost } from '../../../lib/blog-api';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';

// Generate SEO metadata
export async function generateMetadata({ params }) {
    try {
        const data = await getPost(params.slug);
        const post = data.post;

        return {
            title: post.metaTitle || post.title,
            description: post.metaDescription || post.excerpt,
            keywords: post.keywords,
            openGraph: {
                title: post.metaTitle || post.title,
                description: post.metaDescription || post.excerpt,
                images: [post.featuredImage].filter(Boolean),
                type: 'article',
                publishedTime: post.publishedAt,
                modifiedTime: post.updatedAt,
            },
        };
    } catch {
        return {};
    }
}

export default async function BlogPostPage({ params }) {
    let data;
    try {
        data = await getPost(params.slug);
    } catch {
        notFound();
    }

    const { post, relatedPosts } = data;

    // Structured data for SEO
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        image: post.featuredImage,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt,
        author: {
            '@type': 'Person',
            name: post.author,
        },
        publisher: {
            '@type': 'Organization',
            name: 'Your Website Name',
        },
    };

    return (
        <>
            {/* JSON-LD for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <article className="max-w-4xl mx-auto px-4 py-12">
                {/* Featured Image */}
                {post.featuredImage && (
                    <div className="relative h-96 mb-8 rounded-xl overflow-hidden">
                        <Image
                            src={post.featuredImage}
                            alt={post.title}
                            fill
                            priority
                            className="object-cover"
                        />
                    </div>
                )}

                {/* Post Header */}
                <header className="mb-8">
                    {post.category && (
                        <Link
                            href={`/blog?category=${post.category.slug}`}
                            className="text-blue-600 font-semibold hover:underline"
                        >
                            {post.category.name}
                        </Link>
                    )}
                    <h1 className="text-4xl font-bold mt-2 mb-4">{post.title}</h1>
                    <div className="flex items-center gap-4 text-gray-600">
                        <span>By {post.author}</span>
                        <span>•</span>
                        <span>{format(new Date(post.publishedAt), 'MMMM dd, yyyy')}</span>
                        <span>•</span>
                        <span>{post.views} views</span>
                    </div>
                </header>

                {/* Post Content */}
                {post.excerpt && (
                    <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                        {post.excerpt}
                    </p>
                )}

                <div
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Tags */}
                {post.tags.length > 0 && (
                    <div className="mt-12 pt-8 border-t">
                        <h3 className="text-lg font-semibold mb-4">Tags:</h3>
                        <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag) => (
                                <span
                                    key={tag.id}
                                    className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                                >
                                    #{tag.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-2xl font-bold mb-8">Related Articles</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {relatedPosts.map((related) => (
                                <Link
                                    key={related.id}
                                    href={`/blog/${related.slug}`}
                                    className="group"
                                >
                                    <div className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition">
                                        {related.featuredImage && (
                                            <div className="relative h-32">
                                                <Image
                                                    src={related.featuredImage}
                                                    alt={related.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="p-4">
                                            <h3 className="font-semibold group-hover:text-blue-600">
                                                {related.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                                {related.excerpt}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </article>
        </>
    );
}
```

### Dynamic Sitemap Generation

```javascript
// app/sitemap.js
import { getSitemapData } from '../lib/blog-api';

export default async function sitemap() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursite.com';

    try {
        const data = await getSitemapData();

        const blogUrls = data.posts.map((post) => ({
            url: `${baseUrl}/blog/${post.slug}`,
            lastModified: new Date(post.updatedAt),
            changeFrequency: 'weekly',
            priority: 0.8,
        }));

        const categoryUrls = data.categories.map((category) => ({
            url: `${baseUrl}/blog?category=${category.slug}`,
            lastModified: new Date(category.updatedAt),
            changeFrequency: 'daily',
            priority: 0.7,
        }));

        const staticPages = [
            {
                url: baseUrl,
                lastModified: new Date(),
                changeFrequency: 'yearly',
                priority: 1,
            },
            {
                url: `${baseUrl}/blog`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.9,
            },
        ];

        return [...staticPages, ...blogUrls, ...categoryUrls];
    } catch (error) {
        console.error('Sitemap generation error:', error);
        return [
            {
                url: baseUrl,
                lastModified: new Date(),
                changeFrequency: 'yearly',
                priority: 1,
            },
        ];
    }
}
```

## 🎨 Styling

### CSS Classes Used

The examples use Tailwind CSS classes. You can customize or replace with your own styles:

```css
/* Key classes for blog styling */
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.prose {
    /* Typography styles for blog content */
    max-width: none;
    color: #374151;
    line-height: 1.75;
}

.prose h2 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-top: 2rem;
    margin-bottom: 1rem;
}

.prose p {
    margin-bottom: 1.25rem;
}
```

## 🔧 Advanced Features

### Custom Loading States

```javascript
'use client'
import { useState, useEffect } from 'react';

export default function BlogPosts() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPosts() {
            try {
                const data = await getPosts({ page: 1, limit: 10 });
                setPosts(data.posts);
            } catch (error) {
                console.error('Failed to fetch posts:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchPosts();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            {/* Render posts */}
        </div>
    );
}
```

### Error Handling

```javascript
async function safeGetPosts(params) {
    try {
        return await getPosts(params);
    } catch (error) {
        if (error.message.includes('401')) {
            console.error('API key invalid or expired');
        } else if (error.message.includes('429')) {
            console.error('Rate limit exceeded');
        } else {
            console.error('Failed to fetch posts:', error);
        }
        
        // Return fallback data
        return { posts: [], pagination: { totalPages: 0 } };
    }
}
```

## 📱 Performance Tips

1. **Use Next.js caching**: The API responses include appropriate `next.revalidate` settings
2. **Image optimization**: Use Next.js `Image` component for featured images
3. **Pagination**: Implement pagination to avoid loading too many posts at once
4. **Static generation**: Use `generateStaticParams` for popular blog posts

## 🔍 SEO Best Practices

1. **Structured Data**: The examples include JSON-LD for rich snippets
2. **Meta Tags**: Use the provided meta titles and descriptions
3. **Image Alt Text**: Always include descriptive alt text for images
4. **Internal Linking**: Link between related posts and categories

## 🆘 Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check your API key in environment variables
2. **403 Forbidden**: Your domain might be inactive or rate limited
3. **404 Not Found**: Verify the API endpoint URLs
4. **CORS Errors**: Ensure your domain is registered in the blog management system

### Debug Mode

Add this to see API calls:

```javascript
const data = await getPosts({ page: 1, limit: 10 });
console.log('API Response:', data);
```

## 💡 Best Practices

1. **Cache API responses** at the application level for better performance
2. **Handle errors gracefully** to provide good user experience
3. **Use TypeScript** for better development experience
4. **Monitor API usage** to stay within rate limits
5. **Optimize images** before displaying them

Need help? Contact support or check the main documentation for more details!