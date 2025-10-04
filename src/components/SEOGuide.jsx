'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function SEOGuide() {
    const { data: session, status } = useSession();
    const searchParams = useSearchParams();
    const router = useRouter();
    const domainId = searchParams.get('domain');

    const [domains, setDomains] = useState([]);
    const [selectedDomain, setSelectedDomain] = useState(domainId || '');
    const [activeTab, setActiveTab] = useState('basics');
    const [loading, setLoading] = useState(true);

    const fetchDomains = useCallback(async () => {
        try {
            const response = await fetch('/api/user/domains');
            if (response.ok) {
                const data = await response.json();
                setDomains(data);
                if (!selectedDomain && data.length > 0) {
                    setSelectedDomain(data[0].id);
                }
            }
        } catch (error) {
            console.error('Error fetching domains:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedDomain]);

    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (!mounted) return;
        if (status === 'loading') return;
        if (!session) {
            router.push('/auth/signin');
            return;
        }
        fetchDomains();
    }, [mounted, status, session, router, fetchDomains]);

    const domain = domains.find((d) => d.id === selectedDomain);

    const tabs = [
        { id: 'basics', name: 'SEO Basics', icon: '🎯' },
        { id: 'integration', name: 'API Integration', icon: '⚡' },
        { id: 'domains', name: 'Domain Setup', icon: '🔗' },
        { id: 'sitemap', name: 'Sitemap & SEO', icon: '📍' },
        { id: 'tips', name: 'Pro Tips', icon: '💎' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-yellow-500 text-xl">Loading SEO guide...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center text-gray-300 hover:text-white bg-gray-800/60 border border-gray-700 px-3 py-2 rounded-lg"
                        title="Back to Dashboard"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Link>
                    <h1 className="text-3xl font-bold text-white">SEO Guide — Easy & Practical 🚀</h1>
                </div>
            </div>

            {/* Domain selector (visible when you have more than one domain) */}
            {domains.length > 1 && (
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <label className="block text-gray-300 text-sm font-medium mb-2">Select Domain:</label>
                    <select
                        value={selectedDomain}
                        onChange={(e) => setSelectedDomain(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                    >
                        {domains.map((d) => (
                            <option key={d.id} value={d.id}>
                                {d.domain}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* If user has no domains, show a friendly helper instead of an empty screen on some tabs */}
            {domains.length === 0 && (
                <div className="bg-yellow-500/10 border border-yellow-700 rounded-lg p-4">
                    <p className="text-yellow-400">
                        You don’t have any domains yet. Add a domain first to unlock API keys and integration steps.
                    </p>
                    <div className="mt-3">
                        <Link href="/dashboard/domains" className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-semibold">
                            Go to Domains
                        </Link>
                    </div>
                </div>
            )}

            <div className="bg-gray-900 rounded-lg border border-gray-700">
                <div className="flex flex-wrap border-b border-gray-700">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.id
                                ? 'bg-yellow-500 text-black'
                                : 'text-gray-300 hover:text-white hover:bg-gray-800'
                                }`}
                        >
                            <span className="mr-2">{tab.icon}</span>
                            {tab.name}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {activeTab === 'basics' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-white mb-4">On‑page Essentials</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-800 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-yellow-500 mb-3">Title & Description</h3>
                                    <ul className="space-y-2 text-gray-300">
                                        <li>Title 50–60 chars, put keyword early</li>
                                        <li>Description 150–160 chars, actionable</li>
                                        <li>One H1, proper H2/H3 hierarchy</li>
                                        <li>Internal links to related posts</li>
                                    </ul>
                                </div>
                                <div className="bg-gray-800 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-yellow-500 mb-3">URLs & Media</h3>
                                    <ul className="space-y-2 text-gray-300">
                                        <li>Short, hyphen‑separated slugs</li>
                                        <li>Use Next/Image; add alt text</li>
                                        <li>Compress images (TinyPNG/AVIF/WebP)</li>
                                        <li>CDN via Cloudflare R2/public host</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'integration' && domain && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-white mb-4">Easy Integration</h2>

                            <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4 mb-6">
                                <h3 className="text-yellow-500 font-semibold mb-2">Domain: {domain.domain}</h3>
                                <p className="text-gray-300">Use the snippets below in your Next.js app.</p>
                            </div>

                            <div className="bg-gray-800 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-3">Environment (.env.local)</h3>
                                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                                    <pre className="text-sm text-green-400">{`# Public site base URL
NEXT_PUBLIC_SITE_URL=https://your-domain.com
# Public Blog API (optional if same host)
NEXT_PUBLIC_BLOG_API_URL=https://bloxly.vercel.app
NEXT_PUBLIC_BLOG_API_KEY=${domain.apiKey}

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX`}</pre>
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-3">Install packages (client project)</h3>
                                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                                    <pre className="text-sm text-blue-400">{`# with pnpm (recommended)
pnpm add date-fns prismjs sharp
pnpm add -D @types/prismjs

# or with npm
npm install date-fns prismjs sharp
npm install -D @types/prismjs`}</pre>
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-3">lib/blog-api.ts (client helper)</h3>
                                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                                    <pre className="text-sm text-green-400">{`const BLOG_API_URL = process.env.NEXT_PUBLIC_BLOG_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_BLOG_API_KEY;

interface FetchOptions extends RequestInit {
    cache?: RequestCache;
    next?: { revalidate?: number | false; tags?: string[] };
}

async function blogFetch(endpoint: string, options: FetchOptions = {}) {
    if (!BLOG_API_URL) throw new Error('NEXT_PUBLIC_BLOG_API_URL not found');
    if (!API_KEY) throw new Error('NEXT_PUBLIC_BLOG_API_KEY not found');
    const url = BLOG_API_URL + endpoint;
    const res = await fetch(url, {
        ...options,
        headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json', ...(options.headers || {}) },
    });
    if (!res.ok) throw new Error('API Error: ' + res.status + ' - ' + (await res.text()));
    return res.json();
}

export async function getPosts(params: { page?: number; limit?: number; category?: string; tag?: string } = {}) {
    const q = new URLSearchParams();
    if (params.page) q.append('page', String(params.page));
    if (params.limit) q.append('limit', String(params.limit));
    if (params.category) q.append('category', params.category);
    if (params.tag) q.append('tag', params.tag);
    return blogFetch('/api/public/posts?' + q.toString(), { next: { revalidate: 60 } });
}

export async function getPost(slug: string) {
    return blogFetch('/api/public/posts/' + slug, { next: { revalidate: 300 } });
}

export async function getCategories() {
    return blogFetch('/api/public/categories', { next: { revalidate: 600 } });
}

export async function getSitemapData() {
    return blogFetch('/api/public/sitemap', { next: { revalidate: 3600 } });
}`}</pre>
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-3">next.config.mjs (client)</h3>
                                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                                    <pre className="text-sm text-green-400">{`/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        formats: ['image/avif', 'image/webp'],
        remotePatterns: [
            { protocol: 'https', hostname: 'g0p7auwucr.ufs.sh' },
            { protocol: 'https', hostname: 'utfs.io' },
            { protocol: 'https', hostname: 'pub-e011511fdabb4213b96593d74959b8ca.r2.dev' },
            { protocol: 'https', hostname: '*.r2.dev' },
            { protocol: 'https', hostname: 'res.cloudinary.com' },
            { protocol: 'https', hostname: 'images.ctfassets.net' },
        ],
    },
    compiler: { removeConsole: process.env.NODE_ENV === 'production' },
    eslint: { ignoreDuringBuilds: true },
    compress: true,
    async headers() {
        return [
            { source: '/:all*(png|jpg|jpeg|gif|webp|avif|svg)', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
            { source: '/:all*(js|css)', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
        ];
    },
    assetPrefix: process.env.NEXT_PUBLIC_CDN_URL || undefined,
};

export default nextConfig;`}</pre>
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-3">/blog page (client, minimal)</h3>
                                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                                    <pre className="text-sm text-green-400">{`import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { getPosts, getCategories } from '@/lib/blog-api';

export default async function BlogPage({ searchParams }: { searchParams: { page?: string; category?: string } }) {
    const page = parseInt(searchParams.page || '1');
    const category = searchParams.category;
    const [postsRes, catsRes] = await Promise.allSettled([
        getPosts({ page, limit: 12, category }),
        getCategories(),
    ]);
    const postsData = postsRes.status === 'fulfilled' ? postsRes.value : { posts: [], pagination: { totalPages: 1 } };
    const categoriesData = catsRes.status === 'fulfilled' ? catsRes.value : { categories: [] };
    return (<div>{/* render posts and categories like your design */}</div>);
}`}</pre>
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-3">/blog/[slug] page (client, minimal)</h3>
                                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                                    <pre className="text-sm text-green-400">{`import { notFound } from 'next/navigation';
import { getPost } from '@/lib/blog-api';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    try {
        const { post } = await getPost(params.slug);
        const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com';
        return {
            title: { absolute: post.metaTitle || post.title },
            description: post.metaDescription || post.excerpt,
            alternates: { canonical: base + '/blog/' + params.slug },
            openGraph: { title: post.title, description: post.excerpt, url: base + '/blog/' + params.slug, type: 'article', images: post.featuredImage ? [post.featuredImage] : [] },
            twitter: { card: 'summary_large_image', title: post.title, images: post.featuredImage ? [post.featuredImage] : [] },
            robots: { index: true, follow: true },
        };
    } catch { return {}; }
}

export default async function Page({ params }: { params: { slug: string } }) {
    try {
        const { post } = await getPost(params.slug);
        return <article dangerouslySetInnerHTML={{ __html: post.content }} />;
    } catch { notFound(); }
}`}</pre>
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-3">Components (client)</h3>
                                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                                    <pre className="text-sm text-green-400">{`// TableOfContents.tsx
export type TocHeading = { id: string; text: string };
export const TableOfContents = ({ headings }: { headings: TocHeading[] }) => (
    <nav className='toc sticky top-24 p-4 rounded-lg bg-gray-50 border border-gray-200'>
        <h3 className='text-sm font-semibold mb-3 text-gray-800'>Table of Contents</h3>
        <ul className='space-y-2 text-sm'>
            {headings.map((h) => (<li key={h.id}><a href={'#' + h.id} className='text-blue-600 hover:underline'>{h.text}</a></li>))}
        </ul>
    </nav>
);

// Breadcrumbs.tsx
import Link from 'next/link';
type Crumb = { name: string; href?: string };
export function Breadcrumbs({ items }: { items: Crumb[] }) {
    return (
        <nav aria-label='Breadcrumb' className='text-sm text-gray-600' itemScope itemType='https://schema.org/BreadcrumbList'>
            <ol className='flex items-center gap-2 flex-wrap'>
                {items.map((item, index) => (
                    <li key={item.name + '-' + index} itemProp='itemListElement' itemScope itemType='https://schema.org/ListItem' className='flex items-center gap-2'>
                        {item.href ? (
                            <Link href={item.href} itemProp='item' className='hover:text-black/80'><span itemProp='name'>{item.name}</span></Link>
                        ) : (
                            <span itemProp='name' aria-current='page' className='font-medium text-gray-900'>{item.name}</span>
                        )}
                        <meta itemProp='position' content={String(index + 1)} />
                        {index < items.length - 1 && <span className='opacity-60'>/</span>}
                    </li>
                ))}
            </ol>
        </nav>
    );
}

// ArticleJsonLd.tsx
export function ArticleJsonLd({ post }: { post: { slug: string; title: string; excerpt?: string; featuredImage?: string; publishedAt?: string; updatedAt?: string; author?: string; wordCount?: number; category?: string | { name: string } } }) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com';
    const categoryName = typeof post.category === 'string' ? post.category : post.category?.name;
    const schema = { '@context': 'https://schema.org', '@graph': [ { '@type': 'Article', '@id': baseUrl + '/blog/' + post.slug + '/#article', headline: post.title, description: post.excerpt, image: post.featuredImage ? { '@type': 'ImageObject', url: post.featuredImage, width: 1200, height: 630 } : undefined, datePublished: post.publishedAt, dateModified: post.updatedAt, author: post.author ? { '@type': 'Person', name: post.author } : undefined, publisher: { '@type': 'Organization', name: 'Your Site' }, mainEntityOfPage: { '@type': 'WebPage', '@id': baseUrl + '/blog/' + post.slug + '/' }, wordCount: post.wordCount, articleSection: categoryName } ] };
    return <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

// CodeHighlighter.tsx (client)
'use client';
import { useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
export default function CodeHighlighter() { useEffect(() => { Prism.highlightAll(); }, []); return null; }`}</pre>
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-3">generateMetadata for Blog Post</h3>
                                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                                    <pre className="text-sm text-green-400">{`import { Metadata } from 'next';
import { getPost } from '@/lib/blog-api';

export async function generateMetadata({ params }): Promise<Metadata> {
  const { post } = await getPost(params.slug);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com';
  const year = new Date().getFullYear();
  const title = /laravel\\s*vs\\s*node/i.test(post.title)
    ? 'Your Blog Title  ' + year + '?'
    : (post.metaTitle || post.title);

  return {
    title,
    description: post.metaDescription || post.excerpt,
    keywords: ['blog', 'blogs'],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: baseUrl + '/blog/' + params.slug,
      siteName: 'Your Site Name',
      images: post.featuredImage ? [{ url: post.featuredImage, width: 1200, height: 630 }] : [],
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.featuredImage ? [post.featuredImage] : undefined,
    },
  alternates: { canonical: baseUrl + '/blog/' + params.slug },
    robots: { index: true, follow: true },
  };
}`}</pre>
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-3">Next/Image hero example</h3>
                                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                                    <pre className="text-sm text-green-400">{`<Image
  src={post.featuredImage}
  alt={post.title}
  width={1200}
  height={630}
  priority
  sizes="(max-width: 768px) 100vw, 1200px"
/>`}</pre>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'integration' && !domain && (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-white mb-2">Integration</h2>
                            <p className="text-gray-300">Select a domain to view API keys and copy‑paste snippets.</p>
                            <Link href="/dashboard/domains" className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-semibold">
                                Add a Domain
                            </Link>
                        </div>
                    )}

                    {activeTab === 'domains' && domain && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-white mb-4">Domain‑specific details</h2>
                            <div className="bg-gray-800 rounded-lg p-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
                                        <span className="text-gray-300">Domain:</span>
                                        <code className="text-yellow-400">{domain.domain}</code>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
                                        <span className="text-gray-300">API Key:</span>
                                        <div className="flex items-center gap-2">
                                            <code className="text-green-400 text-sm font-mono">{domain.apiKey}</code>
                                            <button
                                                onClick={() => navigator.clipboard.writeText(domain.apiKey)}
                                                className="bg-yellow-500 hover:bg-yellow-600 text-black px-2 py-1 rounded text-xs"
                                            >
                                                Copy
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'domains' && !domain && (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-white mb-2">Domain Setup</h2>
                            <p className="text-gray-300">You’ll see your API key and domain info here after you add a domain.</p>
                            <Link href="/dashboard/domains" className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-semibold">
                                Go to Domains
                            </Link>
                        </div>
                    )}

                    {activeTab === 'sitemap' && domain && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-white mb-4">Sitemap & robots</h2>
                            <div className="bg-gray-800 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-3">sitemap.js</h3>
                                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                                    <pre className="text-sm text-green-400">{`import { getPosts } from '@/lib/blog-api';

export default async function sitemap() {
  const postsData = await getPosts({ page: 1, limit: 1000 });
  const posts = postsData.posts || [];
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com';

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: baseUrl + '/blog', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    ...posts.map((p) => ({
      url: baseUrl + '/blog/' + p.slug,
      lastModified: new Date(p.updatedAt || p.publishedAt),
      changeFrequency: 'weekly',
      priority: 0.8,
    })),
  ];
}`}</pre>
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-3">Or build from public JSON API</h3>
                                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                                    <pre className="text-sm text-green-400">{`import { getSitemapData } from '@/lib/blog-api';

export default async function sitemap() {
    const data = await getSitemapData();
    const base = process.env.NEXT_PUBLIC_SITE_URL || data.baseUrl || 'https://your-domain.com';
    const now = new Date();
    return [
        { url: base, lastModified: now, changeFrequency: 'yearly', priority: 1 },
        { url: base + '/blog', lastModified: now, changeFrequency: 'daily', priority: 0.9 },
        ...data.posts.map((p) => ({ url: base + '/blog/' + p.slug, lastModified: new Date(p.updatedAt || p.publishedAt), changeFrequency: 'weekly', priority: 0.8 })),
        ...data.categories.map((c) => ({ url: base + '/blog/category/' + c.slug, lastModified: now, changeFrequency: 'weekly', priority: 0.7 })),
        ...data.tags.map((t) => ({ url: base + '/blog/tag/' + t.slug, lastModified: now, changeFrequency: 'weekly', priority: 0.6 })),
    ];
}`}</pre>
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-3">robots.js</h3>
                                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                                    <pre className="text-sm text-green-400">{`export default function robots() {
    const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com';
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin/', '/api/'] },
    sitemap: base + '/sitemap.xml',
  };
}`}</pre>
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-3">Public endpoints (headers & shapes)</h3>
                                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                                    <pre className="text-sm text-cyan-400">{`All requests must include:  x-api-key: ${domain.apiKey}

GET /api/public/posts?page=1&limit=10&category=slug&tag=slug
-> { posts: Post[], pagination: { page, limit, total, totalPages } }

GET /api/public/posts/[slug]
-> { post: Post, relatedPosts: Post[] }

GET /api/public/categories
-> { categories: { id, name, slug, _count: { posts } }[] }

GET /api/public/sitemap
-> { baseUrl, generatedAt, counts: { posts, categories, tags }, posts: { slug, updatedAt, publishedAt }[], categories: { slug }[], tags: { slug }[] }`}</pre>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'sitemap' && !domain && (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-white mb-2">Sitemap & robots</h2>
                            <p className="text-gray-300">Select a domain to generate domain‑aware URLs in the examples.</p>
                        </div>
                    )}

                    {activeTab === 'tips' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-white mb-4">Performance & SEO Tips</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-800 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-yellow-500 mb-3">Performance</h3>
                                    <ul className="space-y-2 text-gray-300">
                                        <li>Use Next/Image (AVIF/WebP, sizes, lazy loading)</li>
                                        <li>Enable SWC minify and compression (Next default)</li>
                                        <li>Serve images from Cloudflare R2 public host</li>
                                        <li>Use dynamic import for heavy components</li>
                                    </ul>
                                </div>
                                <div className="bg-gray-800 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-blue-400 mb-3">Content</h3>
                                    <ul className="space-y-2 text-gray-300">
                                        <li>Write comprehensive posts (1000+ words)</li>
                                        <li>Use ToC, comparison tables, FAQs</li>
                                        <li>Add JSON‑LD (Article, Breadcrumb)</li>
                                        <li>Keep titles unique and compelling</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
