'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Plus,
    Edit3,
    Trash2,
    Eye,
    Calendar,
    Globe,
    Tag,
    BarChart3,
    Search,
    Filter,
    FileText,
    Code,
    ExternalLink
} from 'lucide-react';
import Image from 'next/image';

export default function UserBlogsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [posts, setPosts] = useState([]);
    const [domains, setDomains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDomain, setSelectedDomain] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        if (status === 'loading') return;

        if (!session) {
            router.push('/auth/signin');
            return;
        }

        fetchUserData();
    }, [session, status, router]);

    const fetchUserData = async () => {
        try {
            const [postsRes, domainsRes] = await Promise.all([
                fetch('/api/user/posts'),
                fetch('/api/user/domains')
            ]);

            if (postsRes.ok) {
                const postsData = await postsRes.json();
                setPosts(postsData);
            }

            if (domainsRes.ok) {
                const domainsData = await domainsRes.json();
                setDomains(domainsData);
            }
        } catch (error) {
            console.error('Failed to fetch user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const deletePost = async (postId) => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        try {
            const response = await fetch(`/api/posts/${postId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchUserData();
            }
        } catch (error) {
            console.error('Failed to delete post:', error);
        }
    };

    const filteredPosts = posts.filter(post => {
        const matchesSearch =
            post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.author.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDomain = selectedDomain === 'all' || post.domainId === selectedDomain;
        const matchesStatus = statusFilter === 'all' || post.status === statusFilter;

        return matchesSearch && matchesDomain && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'PUBLISHED':
                return 'bg-green-100 text-green-800';
            case 'DRAFT':
                return 'bg-yellow-100 text-yellow-800';
            case 'ARCHIVED':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (status === 'loading' || loading) {
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
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/dashboard"
                                className="text-gray-400 hover:text-yellow-500 transition-colors"
                            >
                                ← Dashboard
                            </Link>
                            <h1 className="text-3xl font-bold text-white">My Blog Posts</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/user/blogs/seo-guide"
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                            >
                                <Code className="h-4 w-4" />
                                <span>SEO Integration Guide</span>
                            </Link>
                            <Link
                                href="/user/blogs/create"
                                className="bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors flex items-center space-x-2"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Create New Post</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Search posts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-800 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
                        />
                    </div>

                    <select
                        value={selectedDomain}
                        onChange={(e) => setSelectedDomain(e.target.value)}
                        className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
                    >
                        <option value="all">All Domains</option>
                        {domains.map((domain) => (
                            <option key={domain.id} value={domain.id}>
                                {domain.domain}
                            </option>
                        ))}
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
                    >
                        <option value="all">All Status</option>
                        <option value="PUBLISHED">Published</option>
                        <option value="DRAFT">Draft</option>
                        <option value="ARCHIVED">Archived</option>
                    </select>
                </div>

                {/* Posts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPosts.map((post) => (
                        <div key={post.id} className="bg-gray-900 rounded-lg border border-gray-800 p-6 hover:border-yellow-500 transition-all duration-200">
                            {/* Post Image */}
                            {post.featuredImage && (
                                <div className="aspect-video bg-gray-800 rounded-lg mb-4 overflow-hidden">
                                    <Image
                                        src={post.featuredImage}
                                        alt={post.title}
                                        className="w-full h-full object-cover"
                                        width={400}
                                        height={225}
                                    />
                                </div>
                            )}

                            {/* Post Content */}
                            <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                    <h3 className="text-lg font-bold text-white line-clamp-2">
                                        {post.title}
                                    </h3>
                                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusColor(post.status)}`}>
                                        {post.status}
                                    </span>
                                </div>

                                {post.excerpt && (
                                    <p className="text-gray-400 text-sm line-clamp-3">
                                        {post.excerpt}
                                    </p>
                                )}

                                {/* Domain & Tags */}
                                <div className="space-y-2">
                                    {post.domain && (
                                        <div className="flex items-center text-xs text-gray-500">
                                            <Globe className="h-3 w-3 mr-1" />
                                            {post.domain.domain}
                                        </div>
                                    )}

                                    {post.tags && post.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {post.tags.slice(0, 3).map((tag) => (
                                                <span
                                                    key={tag.id}
                                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-800 text-gray-300"
                                                >
                                                    <Tag className="h-2 w-2 mr-1" />
                                                    {tag.name}
                                                </span>
                                            ))}
                                            {post.tags.length > 3 && (
                                                <span className="text-xs text-gray-500">
                                                    +{post.tags.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Stats */}
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex items-center">
                                            <BarChart3 className="h-3 w-3 mr-1" />
                                            {post.views} views
                                        </div>
                                        <div className="flex items-center">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                                    <div className="flex items-center space-x-2">
                                        {post.status === 'PUBLISHED' && (
                                            <Link
                                                href={`/blog/${post.slug}`}
                                                className="text-blue-500 hover:text-blue-400 p-1"
                                                target="_blank"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </Link>
                                        )}
                                        <Link
                                            href={`/user/blogs/edit/${post.id}`}
                                            className="text-yellow-500 hover:text-yellow-400 p-1"
                                        >
                                            <Edit3 className="h-4 w-4" />
                                        </Link>
                                        <button
                                            onClick={() => deletePost(post.id)}
                                            className="text-red-500 hover:text-red-400 p-1"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="text-xs text-gray-500">
                                        {post.publishedAt ? (
                                            `Published ${new Date(post.publishedAt).toLocaleDateString()}`
                                        ) : (
                                            'Not published'
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredPosts.length === 0 && (
                    <div className="text-center py-12">
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-300">No posts found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first blog post.'}
                        </p>
                        <div className="mt-6">
                            <Link
                                href="/user/blogs/create"
                                className="bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors inline-flex items-center space-x-2"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Create Your First Post</span>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}