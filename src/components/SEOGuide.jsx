'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';

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
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">SEO Guide — Easy & Practical 🚀</h1>
            </div>

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
NEXT_PUBLIC_BLOG_API_URL=https://your-domain.com
NEXT_PUBLIC_BLOG_API_KEY=${domain.apiKey}

# Cloudflare R2 (media CDN)
CLOUDFLARE_ACCOUNT_ID=xxxxx
CLOUDFLARE_BUCKET_NAME=blogs-media
CLOUDFLARE_R2_PUBLIC_HOST=pub-${'${CLOUDFLARE_ACCOUNT_ID}'}.r2.dev
CLOUDFLARE_R2_PATH_STYLE=bucket

# Optional: TinyPNG for pre-compressing images
TINYPNG_API_KEY=your_tinypng_key

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX`}</pre>
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-3">generateMetadata for Blog Post</h3>
                                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                                    <pre className="text-sm text-green-400">{`import { Metadata } from 'next';
import { getPost } from '@/lib/blog-api';

export async function generateMetadata({ params }): Promise<Metadata> {
  const { post } = await getPost(params.slug);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://codexprime.in';
  const year = new Date().getFullYear();
  const title = /laravel\\s*vs\\s*node/i.test(post.title)
    ? 'Laravel vs Node.js: Which is Best for Web Development in ' + year + '?'
    : (post.metaTitle || post.title);

  return {
    title,
    description: post.metaDescription || post.excerpt,
    keywords: ['laravel','nodejs','web development','php','javascript'],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: baseUrl + '/blog/' + params.slug,
      siteName: 'CodeXprime',
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
