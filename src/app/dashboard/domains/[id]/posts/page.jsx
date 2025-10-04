'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function DomainPostsPage() {
    const params = useParams();
    const domainId = params.id;

    const [posts, setPosts] = useState([]);
    const [domain, setDomain] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    const fetchDomainData = useCallback(async () => {
        try {
            const response = await fetch('/api/user/domains');
            if (response.ok) {
                const domains = await response.json();
                const foundDomain = domains.find(d => d.id === domainId);
                setDomain(foundDomain);
            }
        } catch (error) {
            console.error('Error fetching domain:', error);
        }
    }, [domainId]);

    const fetchPosts = useCallback(async () => {
        try {
            const params = new URLSearchParams({
                domain: domainId,
                ...(filter !== 'all' && { status: filter }),
                ...(search && { search })
            });

            const response = await fetch(`/api/user/posts?${params}`);
            if (response.ok) {
                const data = await response.json();
                setPosts(data);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    }, [domainId, filter, search]);

    useEffect(() => {
        if (domainId) {
            fetchDomainData();
            fetchPosts();
        }
    }, [domainId, fetchDomainData, fetchPosts]);

    const handleDelete = async (postId) => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        try {
            const response = await fetch(`/api/posts/${postId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchPosts();
            } else {
                alert('Failed to delete post');
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('Failed to delete post');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-yellow-500 text-xl">Loading posts...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <div className="flex items-center space-x-2 text-gray-400 text-sm mb-2">
                        <Link href="/dashboard/domains" className="hover:text-yellow-500">
                            Domains
                        </Link>
                        <span>›</span>
                        <span>{domain?.domain || 'Domain'}</span>
                        <span>›</span>
                        <span>Posts</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white">
                        Posts for {domain?.domain}
                    </h1>
                    <p className="text-gray-400 mt-2">
                        {posts.length} posts found
                    </p>
                </div>
                <Link
                    href={`/dashboard/blogs/create?domain=${domainId}`}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                    Create New Post
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${filter === 'all'
                                ? 'bg-yellow-500 text-black'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            All Posts
                        </button>
                        <button
                            onClick={() => setFilter('PUBLISHED')}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${filter === 'PUBLISHED'
                                ? 'bg-yellow-500 text-black'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            Published
                        </button>
                        <button
                            onClick={() => setFilter('DRAFT')}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${filter === 'DRAFT'
                                ? 'bg-yellow-500 text-black'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            Drafts
                        </button>
                    </div>
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search posts..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                        />
                    </div>
                </div>
            </div>

            {/* Posts Grid */}
            {posts.length === 0 ? (
                <div className="bg-gray-900 rounded-lg p-8 border border-gray-700 text-center">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Posts Found</h3>
                    <p className="text-gray-400 mb-4">
                        {search || filter !== 'all'
                            ? 'Try adjusting your filters or search terms'
                            : 'Create your first blog post for this domain'
                        }
                    </p>
                    <Link
                        href={`/dashboard/blogs/create?domain=${domainId}`}
                        className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-lg font-semibold transition-colors"
                    >
                        Create Your First Post
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6">
                    {posts.map((post) => (
                        <div key={post.id} className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h3 className="text-xl font-semibold text-white">
                                            {post.title}
                                        </h3>
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${post.status === 'PUBLISHED'
                                            ? 'bg-green-500 text-black'
                                            : post.status === 'DRAFT'
                                                ? 'bg-yellow-500 text-black'
                                                : 'bg-gray-500 text-white'
                                            }`}>
                                            {post.status}
                                        </span>
                                    </div>

                                    {post.excerpt && (
                                        <p className="text-gray-400 mb-3 line-clamp-2">
                                            {post.excerpt}
                                        </p>
                                    )}

                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                        <span>Slug: /{post.slug}</span>
                                        <span>Views: {post.views || 0}</span>
                                        <span>
                                            {post.publishedAt
                                                ? `Published: ${new Date(post.publishedAt).toLocaleDateString()}`
                                                : `Created: ${new Date(post.createdAt).toLocaleDateString()}`
                                            }
                                        </span>
                                    </div>

                                    {post.category && (
                                        <div className="mt-2">
                                            <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                                                {post.category.name}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {post.featuredImage && (
                                    <div className="ml-4">
                                        <Image
                                            src={post.featuredImage}
                                            alt={post.title}
                                            className="w-24 h-16 object-cover rounded"
                                            width={96}
                                            height={64}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex space-x-3">
                                <Link
                                    href={`/dashboard/blogs/edit/${post.id}`}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                                >
                                    Edit
                                </Link>
                                <Link
                                    href={`/blog/${post.slug}`}
                                    target="_blank"
                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                                >
                                    View
                                </Link>
                                <button
                                    onClick={() => handleDelete(post.id)}
                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}