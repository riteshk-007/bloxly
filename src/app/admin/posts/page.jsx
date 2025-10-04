'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    Search,
    FileText,
    Edit3,
    Trash2,
    Eye,
    Calendar,
    User,
    Globe,
    Tag,
    BarChart3
} from 'lucide-react';

export default function AdminPosts() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        if (status === 'loading') return;

        if (!session?.user?.role || session.user.role !== 'ADMIN') {
            router.push('/auth/signin');
            return;
        }

        fetchPosts();
    }, [session, status, router]);

    const fetchPosts = async () => {
        try {
            const response = await fetch('/api/admin/posts');
            if (response.ok) {
                const data = await response.json();
                setPosts(data);
            }
        } catch (error) {
            console.error('Failed to fetch posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const deletePost = async (postId) => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        try {
            const response = await fetch(`/api/admin/posts/${postId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchPosts();
            }
        } catch (error) {
            console.error('Failed to delete post:', error);
        }
    };

    const updatePostStatus = async (postId, newStatus) => {
        try {
            const response = await fetch(`/api/admin/posts/${postId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                fetchPosts();
            }
        } catch (error) {
            console.error('Failed to update post status:', error);
        }
    };

    const filteredPosts = posts.filter(post => {
        const matchesSearch =
            post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.domain?.domain.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || post.status === statusFilter;

        return matchesSearch && matchesStatus;
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/admin"
                            className="text-gray-400 hover:text-yellow-500 transition-colors"
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </Link>
                        <h1 className="text-3xl font-bold text-white">Content Management</h1>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
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

                {/* Posts Table */}
                <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Post
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Domain
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Author
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Views
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {filteredPosts.map((post) => (
                                    <tr key={post.id} className="hover:bg-gray-800">
                                        <td className="px-6 py-4">
                                            <div className="flex items-start">
                                                <FileText className="h-5 w-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-sm font-medium text-white truncate">
                                                        {post.title}
                                                    </div>
                                                    {post.excerpt && (
                                                        <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                                                            {post.excerpt}
                                                        </div>
                                                    )}
                                                    {post.tags && post.tags.length > 0 && (
                                                        <div className="flex items-center mt-2 space-x-1">
                                                            <Tag className="h-3 w-3 text-gray-400" />
                                                            <div className="flex flex-wrap gap-1">
                                                                {post.tags.slice(0, 3).map((tag) => (
                                                                    <span
                                                                        key={tag.id}
                                                                        className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-800 text-gray-300"
                                                                    >
                                                                        {tag.name}
                                                                    </span>
                                                                ))}
                                                                {post.tags.length > 3 && (
                                                                    <span className="text-xs text-gray-500">
                                                                        +{post.tags.length - 3} more
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Globe className="h-4 w-4 text-gray-400 mr-2" />
                                                <span className="text-sm text-white">
                                                    {post.domain?.domain || 'No domain'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <User className="h-4 w-4 text-gray-400 mr-2" />
                                                <span className="text-sm text-white">{post.author}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={post.status}
                                                onChange={(e) => updatePostStatus(post.id, e.target.value)}
                                                className={`text-xs px-2 py-1 rounded-full border-0 ${getStatusColor(post.status)}`}
                                            >
                                                <option value="DRAFT">Draft</option>
                                                <option value="PUBLISHED">Published</option>
                                                <option value="ARCHIVED">Archived</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <BarChart3 className="h-4 w-4 text-gray-400 mr-1" />
                                                <span className="text-sm text-gray-300">{post.views}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            <div className="flex items-center">
                                                <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                                                {new Date(post.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <Link
                                                    href={`/blog/${post.slug}`}
                                                    className="text-blue-500 hover:text-blue-400"
                                                    target="_blank"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                                <button className="text-yellow-500 hover:text-yellow-400">
                                                    <Edit3 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => deletePost(post.id)}
                                                    className="text-red-500 hover:text-red-400"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {filteredPosts.length === 0 && (
                    <div className="text-center py-12">
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-300">No posts found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm ? 'Try adjusting your search terms.' : 'Posts will appear here once users create them.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}