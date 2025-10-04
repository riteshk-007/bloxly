'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Code,
    Copy,
    ExternalLink,
    CheckCircle,
    AlertCircle,
    FileText,
    Globe,
    Search,
    Zap,
    ArrowLeft
} from 'lucide-react';

export default function SEOGuidePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [userDomains, setUserDomains] = useState([]);
    const [selectedDomain, setSelectedDomain] = useState(null);
    const [copiedCode, setCopiedCode] = useState('');

    useEffect(() => {
        if (status === 'loading') return;

        if (!session) {
            router.push('/auth/signin');
            return;
        }

        fetchUserDomains();
    }, [session, status, router]);

    const fetchUserDomains = async () => {
        try {
            const response = await fetch('/api/user/domains');
            if (response.ok) {
                const domains = await response.json();
                setUserDomains(domains);
                if (domains.length > 0) {
                    setSelectedDomain(domains[0]);
                }
            }
        } catch (error) {
            console.error('Failed to fetch domains:', error);
        }
    };

    const copyToClipboard = (code, section) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(section);
        setTimeout(() => setCopiedCode(''), 2000);
    };

    // Generate code snippets based on user's domain
    const generateCodeSnippets = (domain) => {
        if (!domain) return {};

        return {
            // Blog API Client
            blogAPI: `// lib/blog-api.js
import axios from 'axios';

const BLOG_API_URL = '${process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : 'http://localhost:3000'}';
const API_KEY = '${domain.apiKey}';

const blogAPI = axios.create({
  baseURL: BLOG_API_URL,
  headers: {
    'X-API-Key': API_KEY,
    'Content-Type': 'application/json'
  }
});

export const getBlogPosts = async (page = 1, limit = 12) => {
  try {
    const response = await blogAPI.get(\`/api/public/posts?page=\${page}&limit=\${limit}\`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch blog posts:', error);
    return { posts: [], total: 0, pages: 0 };
  }
};

export const getBlogPost = async (slug) => {
  try {
    const response = await blogAPI.get(\`/api/public/posts/\${slug}\`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch blog post:', error);
    return null;
  }
};

export const getCategories = async () => {
  try {
    const response = await blogAPI.get('/api/public/categories');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
};

export default blogAPI;`,

            // Next.js Blog Page
            blogPage: `// pages/blog/[slug].js or app/blog/[slug]/page.js
import { getBlogPost } from '../../lib/blog-api';
import Head from 'next/head';

export default function BlogPost({ post }) {
  if (!post) {
    return <div>Post not found</div>;
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt || post.metaDescription,
    "image": post.featuredImage,
    "author": {
      "@type": "Person",
      "name": post.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "${domain.domain}",
      "logo": {
        "@type": "ImageObject",
        "url": "https://${domain.domain}/logo.png"
      }
    },
    "datePublished": post.publishedAt,
    "dateModified": post.updatedAt,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": \`https://${domain.domain}/blog/\${post.slug}\`
    }
  };

  return (
    <>
      <Head>
        <title>{\`\${post.metaTitle || post.title} | ${domain.domain}\`}</title>
        <meta name="description" content={post.metaDescription || post.excerpt} />
        <meta name="keywords" content={post.keywords?.join(', ')} />
        
        {/* Open Graph */}
        <meta property="og:title" content={post.metaTitle || post.title} />
        <meta property="og:description" content={post.metaDescription || post.excerpt} />
        <meta property="og:image" content={post.featuredImage} />
        <meta property="og:url" content={\`https://${domain.domain}/blog/\${post.slug}\`} />
        <meta property="og:type" content="article" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.metaTitle || post.title} />
        <meta name="twitter:description" content={post.metaDescription || post.excerpt} />
        <meta name="twitter:image" content={post.featuredImage} />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        
        {/* Canonical URL */}
        <link rel="canonical" href={\`https://${domain.domain}/blog/\${post.slug}\`} />
      </Head>

      <article className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <div className="flex items-center text-gray-600 mb-4">
            <span>By {post.author}</span>
            <span className="mx-2">•</span>
            <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
          </div>
          {post.featuredImage && (
            <img 
              src={post.featuredImage} 
              alt={post.title}
              className="w-full h-64 object-cover rounded-lg"
            />
          )}
        </header>
        
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-8 pt-8 border-t">
            <h3 className="text-lg font-semibold mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span 
                  key={tag.id}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>
    </>
  );
}

// For App Router (app/blog/[slug]/page.js)
export async function generateMetadata({ params }) {
  const post = await getBlogPost(params.slug);
  
  if (!post) {
    return {
      title: 'Post Not Found'
    };
  }

  return {
    title: \`\${post.metaTitle || post.title} | ${domain.domain}\`,
    description: post.metaDescription || post.excerpt,
    keywords: post.keywords,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      images: [post.featuredImage],
      url: \`https://${domain.domain}/blog/\${post.slug}\`,
      type: 'article'
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      images: [post.featuredImage]
    }
  };
}

// Static generation (optional)
export async function generateStaticParams() {
  // Fetch all post slugs for static generation
  return [];
}`,

            // Blog List Page
            blogListPage: `// pages/blog/index.js or app/blog/page.js
import { getBlogPosts, getCategories } from '../lib/blog-api';
import Link from 'next/link';
import Head from 'next/head';

export default function BlogList({ posts, categories, pagination }) {
  return (
    <>
      <Head>
        <title>Blog | ${domain.domain}</title>
        <meta name="description" content="Latest blog posts and articles" />
        <meta property="og:title" content="Blog | ${domain.domain}" />
        <meta property="og:description" content="Latest blog posts and articles" />
        <meta property="og:url" content="https://${domain.domain}/blog" />
        <link rel="canonical" href="https://${domain.domain}/blog" />
      </Head>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Blog</h1>
        
        {/* Categories */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link 
                key={category.id}
                href={\`/blog/category/\${category.slug}\`}
                className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {posts.map((post) => (
            <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {post.featuredImage && (
                <img 
                  src={post.featuredImage} 
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h2 className="text-xl font-bold mb-2">
                  <Link href={\`/blog/\${post.slug}\`} className="hover:text-blue-600">
                    {post.title}
                  </Link>
                </h2>
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <span>{post.author}</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center space-x-2">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
              <Link
                key={page}
                href={\`/blog?page=\${page}\`}
                className={\`px-3 py-2 rounded \${page === pagination.current ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}\`}
              >
                {page}
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export async function getServerSideProps({ query }) {
  const page = parseInt(query.page) || 1;
  const [postsData, categories] = await Promise.all([
    getBlogPosts(page, 12),
    getCategories()
  ]);

  return {
    props: {
      posts: postsData.posts,
      categories,
      pagination: {
        current: page,
        total: postsData.total,
        pages: postsData.pages
      }
    }
  };
}`,

            // Sitemap Generation
            sitemap: `// pages/sitemap.xml.js or app/sitemap.js
import { getBlogPosts } from '../lib/blog-api';

function generateSiteMap(posts) {
  return \`<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>https://${domain.domain}</loc>
       <lastmod>\${new Date().toISOString()}</lastmod>
       <changefreq>daily</changefreq>
       <priority>1.0</priority>
     </url>
     <url>
       <loc>https://${domain.domain}/blog</loc>
       <lastmod>\${new Date().toISOString()}</lastmod>
       <changefreq>daily</changefreq>
       <priority>0.8</priority>
     </url>
     \${posts
       .map((post) => {
         return \`
       <url>
           <loc>https://${domain.domain}/blog/\${post.slug}</loc>
           <lastmod>\${new Date(post.updatedAt).toISOString()}</lastmod>
           <changefreq>weekly</changefreq>
           <priority>0.6</priority>
       </url>
     \`;
       })
       .join('')}
   </urlset>
 \`;
}

// Pages Router
export async function getServerSideProps({ res }) {
  const postsData = await getBlogPosts(1, 1000); // Get all posts
  const sitemap = generateSiteMap(postsData.posts);

  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default function Sitemap() {}

// App Router - app/sitemap.js
export default async function sitemap() {
  const postsData = await getBlogPosts(1, 1000);
  
  const posts = postsData.posts.map((post) => ({
    url: \`https://${domain.domain}/blog/\${post.slug}\`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [
    {
      url: 'https://${domain.domain}',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://${domain.domain}/blog',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    ...posts,
  ];
}`,

            // Environment Variables
            envVars: `# .env.local
NEXT_PUBLIC_BLOG_API_URL=http://localhost:3000
NEXT_PUBLIC_BLOG_API_KEY=${domain.apiKey}

# For production
# NEXT_PUBLIC_BLOG_API_URL=https://yourdomain.com
# NEXT_PUBLIC_BLOG_API_KEY=${domain.apiKey}`
        };
    };

    const codeSnippets = selectedDomain ? generateCodeSnippets(selectedDomain) : {};

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <div className="border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center py-6">
                        <Link
                            href="/user/blogs"
                            className="text-gray-400 hover:text-yellow-500 transition-colors mr-4"
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-white">SEO Integration Guide</h1>
                            <p className="text-gray-400 mt-1">Complete guide to integrate your blog content with WordPress-level SEO</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Domain Selection */}
                {userDomains.length > 0 && (
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Select your domain for customized code:
                        </label>
                        <select
                            value={selectedDomain?.id || ''}
                            onChange={(e) => {
                                const domain = userDomains.find(d => d.id === e.target.value);
                                setSelectedDomain(domain);
                            }}
                            className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                        >
                            {userDomains.map((domain) => (
                                <option key={domain.id} value={domain.id}>
                                    {domain.domain}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Quick Setup Steps */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
                    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                        <div className="flex items-center mb-4">
                            <div className="bg-yellow-500 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                                1
                            </div>
                            <h3 className="text-lg font-bold text-white ml-3">Setup API Client</h3>
                        </div>
                        <p className="text-gray-400 text-sm">Create the blog API client to fetch your content</p>
                    </div>

                    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                        <div className="flex items-center mb-4">
                            <div className="bg-yellow-500 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                                2
                            </div>
                            <h3 className="text-lg font-bold text-white ml-3">Create Pages</h3>
                        </div>
                        <p className="text-gray-400 text-sm">Setup blog listing and individual post pages</p>
                    </div>

                    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                        <div className="flex items-center mb-4">
                            <div className="bg-yellow-500 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                                3
                            </div>
                            <h3 className="text-lg font-bold text-white ml-3">Add SEO</h3>
                        </div>
                        <p className="text-gray-400 text-sm">Implement WordPress-level SEO optimization</p>
                    </div>

                    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                        <div className="flex items-center mb-4">
                            <div className="bg-yellow-500 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                                4
                            </div>
                            <h3 className="text-lg font-bold text-white ml-3">Deploy</h3>
                        </div>
                        <p className="text-gray-400 text-sm">Deploy and enjoy automatic SEO optimization</p>
                    </div>
                </div>

                {selectedDomain && (
                    <div className="space-y-8">
                        {/* Step 1: API Client */}
                        <div className="bg-gray-900 rounded-lg border border-gray-800">
                            <div className="p-6 border-b border-gray-800">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Code className="h-6 w-6 text-yellow-500 mr-3" />
                                        <h2 className="text-xl font-bold text-white">Step 1: Blog API Client</h2>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(codeSnippets.blogAPI, 'blogAPI')}
                                        className="flex items-center space-x-2 bg-yellow-500 text-black px-3 py-1 rounded text-sm hover:bg-yellow-400 transition-colors"
                                    >
                                        {copiedCode === 'blogAPI' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        <span>{copiedCode === 'blogAPI' ? 'Copied!' : 'Copy Code'}</span>
                                    </button>
                                </div>
                                <p className="text-gray-400 mt-2">Create this file to handle all API calls to your blog content.</p>
                            </div>
                            <div className="p-0">
                                <pre className="bg-gray-950 text-green-400 p-6 overflow-x-auto text-sm">
                                    <code>{codeSnippets.blogAPI}</code>
                                </pre>
                            </div>
                        </div>

                        {/* Step 2: Environment Variables */}
                        <div className="bg-gray-900 rounded-lg border border-gray-800">
                            <div className="p-6 border-b border-gray-800">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Zap className="h-6 w-6 text-yellow-500 mr-3" />
                                        <h2 className="text-xl font-bold text-white">Step 2: Environment Variables</h2>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(codeSnippets.envVars, 'envVars')}
                                        className="flex items-center space-x-2 bg-yellow-500 text-black px-3 py-1 rounded text-sm hover:bg-yellow-400 transition-colors"
                                    >
                                        {copiedCode === 'envVars' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        <span>{copiedCode === 'envVars' ? 'Copied!' : 'Copy Code'}</span>
                                    </button>
                                </div>
                                <p className="text-gray-400 mt-2">Add these environment variables to your .env.local file.</p>
                            </div>
                            <div className="p-0">
                                <pre className="bg-gray-950 text-green-400 p-6 overflow-x-auto text-sm">
                                    <code>{codeSnippets.envVars}</code>
                                </pre>
                            </div>
                        </div>

                        {/* Step 3: Blog Post Page */}
                        <div className="bg-gray-900 rounded-lg border border-gray-800">
                            <div className="p-6 border-b border-gray-800">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <FileText className="h-6 w-6 text-yellow-500 mr-3" />
                                        <h2 className="text-xl font-bold text-white">Step 3: Individual Blog Post Page</h2>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(codeSnippets.blogPage, 'blogPage')}
                                        className="flex items-center space-x-2 bg-yellow-500 text-black px-3 py-1 rounded text-sm hover:bg-yellow-400 transition-colors"
                                    >
                                        {copiedCode === 'blogPage' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        <span>{copiedCode === 'blogPage' ? 'Copied!' : 'Copy Code'}</span>
                                    </button>
                                </div>
                                <p className="text-gray-400 mt-2">Complete blog post page with WordPress-level SEO optimization.</p>
                            </div>
                            <div className="p-0">
                                <pre className="bg-gray-950 text-green-400 p-6 overflow-x-auto text-sm">
                                    <code>{codeSnippets.blogPage}</code>
                                </pre>
                            </div>
                        </div>

                        {/* Step 4: Blog List Page */}
                        <div className="bg-gray-900 rounded-lg border border-gray-800">
                            <div className="p-6 border-b border-gray-800">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Globe className="h-6 w-6 text-yellow-500 mr-3" />
                                        <h2 className="text-xl font-bold text-white">Step 4: Blog Listing Page</h2>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(codeSnippets.blogListPage, 'blogListPage')}
                                        className="flex items-center space-x-2 bg-yellow-500 text-black px-3 py-1 rounded text-sm hover:bg-yellow-400 transition-colors"
                                    >
                                        {copiedCode === 'blogListPage' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        <span>{copiedCode === 'blogListPage' ? 'Copied!' : 'Copy Code'}</span>
                                    </button>
                                </div>
                                <p className="text-gray-400 mt-2">Blog listing page with categories and pagination.</p>
                            </div>
                            <div className="p-0">
                                <pre className="bg-gray-950 text-green-400 p-6 overflow-x-auto text-sm">
                                    <code>{codeSnippets.blogListPage}</code>
                                </pre>
                            </div>
                        </div>

                        {/* Step 5: Sitemap Generation */}
                        <div className="bg-gray-900 rounded-lg border border-gray-800">
                            <div className="p-6 border-b border-gray-800">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Search className="h-6 w-6 text-yellow-500 mr-3" />
                                        <h2 className="text-xl font-bold text-white">Step 5: Automatic Sitemap Generation</h2>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(codeSnippets.sitemap, 'sitemap')}
                                        className="flex items-center space-x-2 bg-yellow-500 text-black px-3 py-1 rounded text-sm hover:bg-yellow-400 transition-colors"
                                    >
                                        {copiedCode === 'sitemap' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        <span>{copiedCode === 'sitemap' ? 'Copied!' : 'Copy Code'}</span>
                                    </button>
                                </div>
                                <p className="text-gray-400 mt-2">Automatic sitemap generation for better SEO indexing.</p>
                            </div>
                            <div className="p-0">
                                <pre className="bg-gray-950 text-green-400 p-6 overflow-x-auto text-sm">
                                    <code>{codeSnippets.sitemap}</code>
                                </pre>
                            </div>
                        </div>
                    </div>
                )}

                {/* SEO Features Included */}
                <div className="mt-12 bg-gray-900 rounded-lg border border-gray-800 p-6">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                        WordPress-Level SEO Features Included
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-3">
                            <h3 className="font-semibold text-yellow-500">Meta Tags & SEO</h3>
                            <ul className="space-y-1 text-gray-300 text-sm">
                                <li>• Dynamic page titles</li>
                                <li>• Meta descriptions</li>
                                <li>• Keywords optimization</li>
                                <li>• Canonical URLs</li>
                                <li>• Open Graph tags</li>
                                <li>• Twitter Cards</li>
                            </ul>
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-semibold text-yellow-500">Structured Data</h3>
                            <ul className="space-y-1 text-gray-300 text-sm">
                                <li>• Article schema markup</li>
                                <li>• Author information</li>
                                <li>• Publisher details</li>
                                <li>• Publication dates</li>
                                <li>• Image optimization</li>
                                <li>• Breadcrumb navigation</li>
                            </ul>
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-semibold text-yellow-500">Performance & UX</h3>
                            <ul className="space-y-1 text-gray-300 text-sm">
                                <li>• Automatic sitemap generation</li>
                                <li>• Mobile responsive design</li>
                                <li>• Fast loading times</li>
                                <li>• Category organization</li>
                                <li>• Tag system</li>
                                <li>• Pagination support</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Next Steps */}
                <div className="mt-8 bg-blue-900/20 border border-blue-800 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                        <Zap className="h-5 w-5 text-blue-400 mr-2" />
                        Next Steps
                    </h2>
                    <div className="space-y-3 text-gray-300">
                        <p>1. Copy the code snippets above and implement them in your Next.js project</p>
                        <p>2. Replace the domain placeholders with your actual domain name</p>
                        <p>3. Test the API integration in development mode</p>
                        <p>4. Deploy to production and verify SEO optimization</p>
                        <p>5. Submit your sitemap to Google Search Console for better indexing</p>
                    </div>

                    <div className="mt-6 flex items-center space-x-4">
                        <Link
                            href="/user/blogs"
                            className="bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors"
                        >
                            Back to My Blogs
                        </Link>
                        <a
                            href="https://search.google.com/search-console"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                            <ExternalLink className="h-4 w-4" />
                            <span>Google Search Console</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}