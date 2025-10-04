'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SEOGuidePage() {
  const searchParams = useSearchParams();
  const domainId = searchParams.get('domain');

  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState(domainId || '');
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

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  const getSelectedDomainData = () => {
    return domains.find(d => d.id === selectedDomain);
  };

  const generateBlogApiCode = () => {
    const domain = getSelectedDomainData();
    if (!domain) return '';

    return `// lib/blog-api.js
const BLOG_API_URL = '${window.location.origin}';
const API_KEY = '${domain.apiKey}';

export const blogApi = {
  async getPosts(options = {}) {
    const params = new URLSearchParams({
      ...options,
      apiKey: API_KEY
    });
    
    const response = await fetch(\`\${BLOG_API_URL}/api/public/posts?\${params}\`);
    if (!response.ok) throw new Error('Failed to fetch posts');
    return response.json();
  },

  async getPost(slug) {
    const response = await fetch(\`\${BLOG_API_URL}/api/public/posts/\${slug}?apiKey=\${API_KEY}\`);
    if (!response.ok) throw new Error('Failed to fetch post');
    return response.json();
  },

  async getCategories() {
    const response = await fetch(\`\${BLOG_API_URL}/api/public/categories?apiKey=\${API_KEY}\`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  }
};`;
  };

  const generateNextJSPages = () => {
    const domain = getSelectedDomainData();
    if (!domain) return '';

    return `// pages/blog/index.js
import { blogApi } from '../../lib/blog-api';
import Head from 'next/head';

export default function BlogIndex({ posts, categories }) {
  return (
    <>
      <Head>
        <title>Blog - ${domain.domain}</title>
        <meta name="description" content="Latest blog posts and articles" />
        <meta property="og:title" content="Blog - ${domain.domain}" />
        <meta property="og:description" content="Latest blog posts and articles" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Latest Posts</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <h2 className="text-xl font-semibold mb-2">
                  <a href={\`/blog/\${post.slug}\`} className="hover:text-blue-600">
                    {post.title}
                  </a>
                </h2>
                {post.excerpt && (
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>
                )}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                  {post.category && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {post.category.name}
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}

export async function getStaticProps() {
  try {
    const [posts, categories] = await Promise.all([
      blogApi.getPosts({ status: 'PUBLISHED', limit: 12 }),
      blogApi.getCategories()
    ]);

    return {
      props: { posts, categories },
      revalidate: 3600 // Revalidate every hour
    };
  } catch (error) {
    return {
      props: { posts: [], categories: [] },
      revalidate: 300
    };
  }
}`;
  };

  const generateSinglePostPage = () => {
    return `// pages/blog/[slug].js
import { blogApi } from '../../lib/blog-api';
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
      "name": post.author || "Admin"
    },
    "publisher": {
      "@type": "Organization",
      "name": "${getSelectedDomainData()?.domain || 'Your Site'}"
    },
    "datePublished": post.publishedAt,
    "dateModified": post.updatedAt,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": \`https://${getSelectedDomainData()?.domain || 'yoursite.com'}/blog/\${post.slug}\`
    }
  };

  return (
    <>
      <Head>
        <title>{post.metaTitle || post.title}</title>
        <meta name="description" content={post.metaDescription || post.excerpt} />
        <meta name="keywords" content={post.keywords?.join(', ')} />
        
        {/* Open Graph */}
        <meta property="og:title" content={post.metaTitle || post.title} />
        <meta property="og:description" content={post.metaDescription || post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={post.featuredImage} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.metaTitle || post.title} />
        <meta name="twitter:description" content={post.metaDescription || post.excerpt} />
        <meta name="twitter:image" content={post.featuredImage} />
        
        {/* Structured Data */}
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>
      
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        {post.featuredImage && (
          <img 
            src={post.featuredImage} 
            alt={post.title}
            className="w-full h-64 md:h-96 object-cover rounded-lg mb-8"
          />
        )}
        
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex items-center space-x-4 text-gray-600 mb-4">
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString()}
            </time>
            {post.category && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                {post.category.name}
              </span>
            )}
            <span>{post.views || 0} views</span>
          </div>
          
          {post.excerpt && (
            <p className="text-xl text-gray-700 leading-relaxed">{post.excerpt}</p>
          )}
        </header>
        
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        
        {post.tags && post.tags.length > 0 && (
          <footer className="mt-8 pt-8 border-t">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span 
                  key={tag.id}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          </footer>
        )}
      </article>
    </>
  );
}

export async function getStaticPaths() {
  try {
    const posts = await blogApi.getPosts({ status: 'PUBLISHED' });
    const paths = posts.map((post) => ({
      params: { slug: post.slug }
    }));

    return { paths, fallback: 'blocking' };
  } catch (error) {
    return { paths: [], fallback: 'blocking' };
  }
}

export async function getStaticProps({ params }) {
  try {
    const post = await blogApi.getPost(params.slug);
    return {
      props: { post },
      revalidate: 3600
    };
  } catch (error) {
    return { notFound: true };
  }
}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-yellow-500 text-xl">Loading SEO guide...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">SEO Integration Guide</h1>
        <p className="text-gray-400">
          WordPress-level SEO optimization for your Next.js blog
        </p>
      </div>

      {/* Domain Selection */}
      {domains.length > 1 && (
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Select Domain for Code Generation
          </label>
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
          >
            {domains.map((domain) => (
              <option key={domain.id} value={domain.id}>
                {domain.domain}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Quick Setup */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">🚀 Quick Setup</h2>
        <div className="space-y-4 text-gray-300">
          <div className="flex items-start space-x-3">
            <span className="bg-yellow-500 text-black w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">1</span>
            <div>
              <p className="font-medium">Install Dependencies</p>
              <code className="bg-gray-800 px-2 py-1 rounded text-sm">npm install next react react-dom</code>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="bg-yellow-500 text-black w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">2</span>
            <div>
              <p className="font-medium">Create API Client</p>
              <p className="text-gray-400 text-sm">Copy the blog API code below</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="bg-yellow-500 text-black w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">3</span>
            <div>
              <p className="font-medium">Create Blog Pages</p>
              <p className="text-gray-400 text-sm">Use the Next.js page templates</p>
            </div>
          </div>
        </div>
      </div>

      {/* Blog API Client */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">📡 Blog API Client</h2>
          <button
            onClick={() => navigator.clipboard.writeText(generateBlogApiCode())}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-1 rounded text-sm font-medium"
          >
            Copy Code
          </button>
        </div>
        <pre className="bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
          <code className="text-green-400">{generateBlogApiCode()}</code>
        </pre>
      </div>

      {/* Blog Index Page */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">📝 Blog Index Page</h2>
          <button
            onClick={() => navigator.clipboard.writeText(generateNextJSPages())}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-1 rounded text-sm font-medium"
          >
            Copy Code
          </button>
        </div>
        <pre className="bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm max-h-96">
          <code className="text-blue-400">{generateNextJSPages()}</code>
        </pre>
      </div>

      {/* Single Post Page */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">📄 Single Post Page</h2>
          <button
            onClick={() => navigator.clipboard.writeText(generateSinglePostPage())}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-1 rounded text-sm font-medium"
          >
            Copy Code
          </button>
        </div>
        <pre className="bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm max-h-96">
          <code className="text-purple-400">{generateSinglePostPage()}</code>
        </pre>
      </div>

      {/* SEO Features */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">🔍 SEO Features Included</h2>
        <div className="grid md:grid-cols-2 gap-4 text-gray-300">
          <div className="space-y-2">
            <h3 className="font-semibold text-white">WordPress-Level SEO</h3>
            <ul className="space-y-1 text-sm">
              <li>✅ Custom meta titles & descriptions</li>
              <li>✅ Open Graph tags</li>
              <li>✅ Twitter Card optimization</li>
              <li>✅ Structured data (JSON-LD)</li>
              <li>✅ Automatic sitemaps</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-white">Performance Features</h3>
            <ul className="space-y-1 text-sm">
              <li>✅ Static site generation (SSG)</li>
              <li>✅ Incremental static regeneration</li>
              <li>✅ Image optimization</li>
              <li>✅ Fast loading times</li>
              <li>✅ Mobile-first design</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Domain Info */}
      {getSelectedDomainData() && (
        <div className="bg-blue-900 rounded-lg p-6 border border-blue-700">
          <h2 className="text-xl font-semibold text-white mb-4">🌐 Domain Configuration</h2>
          <div className="space-y-2 text-gray-300">
            <p><strong>Domain:</strong> {getSelectedDomainData().domain}</p>
            <p><strong>API Key:</strong> <code className="bg-gray-800 px-2 py-1 rounded text-yellow-400">{getSelectedDomainData().apiKey}</code></p>
            <p><strong>API Endpoint:</strong> <code className="bg-gray-800 px-2 py-1 rounded text-green-400">{window.location.origin}/api/public</code></p>
          </div>
        </div>
      )}
    </div>
  );
}