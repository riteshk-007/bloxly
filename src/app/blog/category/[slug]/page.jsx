'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Calendar, Clock, ArrowLeft, Tag, User } from 'lucide-react';

export default function CategoryPage() {
    const params = useParams();
    const { slug } = params;

    const [posts, setPosts] = useState([]);
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchPosts = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/public/posts?category=${slug}&page=${page}&limit=10`);
            if (response.ok) {
                const data = await response.json();
                setPosts(data.posts);
                setTotalPages(Math.ceil(data.total / 10));

                // Get category info from first post
                if (data.posts.length > 0 && data.posts[0].category) {
                    setCategory(data.posts[0].category);
                }
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    }, [slug]);

    useEffect(() => {
        if (slug) {
            fetchPosts(currentPage);
        }
    }, [slug, currentPage, fetchPosts]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading && currentPage === 1) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100">
                <div className="container mx-auto px-4 py-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
                        <div className="space-y-6">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                                    <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                                    <div className="h-20 bg-gray-300 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/blog"
                        className="inline-flex items-center text-yellow-600 hover:text-yellow-700 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Blog
                    </Link>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-yellow-200">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Category: {category?.name || slug}
                        </h1>
                        <p className="text-gray-600">
                            {posts.length} {posts.length === 1 ? 'post' : 'posts'} in this category
                        </p>
                    </div>
                </div>

                {/* Posts */}
                {posts.length > 0 ? (
                    <div className="space-y-6">
                        {posts.map((post) => (
                            <article key={post.id} className="bg-white rounded-xl p-6 shadow-sm border border-yellow-200 hover:shadow-md transition-shadow">
                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        {formatDate(post.createdAt)}
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="w-4 h-4 mr-1" />
                                        {post.readTime || '5'} min read
                                    </div>
                                    {post.domain?.user && (
                                        <div className="flex items-center">
                                            <User className="w-4 h-4 mr-1" />
                                            {post.domain.user.name}
                                        </div>
                                    )}
                                </div>

                                <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-yellow-600 transition-colors">
                                    <Link href={`/blog/${post.slug}`}>
                                        {post.title}
                                    </Link>
                                </h2>

                                {post.excerpt && (
                                    <p className="text-gray-600 mb-4 line-clamp-3">
                                        {post.excerpt}
                                    </p>
                                )}

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {post.tags?.map((tag) => (
                                        <Link
                                            key={tag.id}
                                            href={`/blog/tag/${tag.slug}`}
                                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors"
                                        >
                                            <Tag className="w-3 h-3 mr-1" />
                                            {tag.name}
                                        </Link>
                                    ))}
                                </div>

                                <Link
                                    href={`/blog/${post.slug}`}
                                    className="inline-flex items-center text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
                                >
                                    Read more →
                                </Link>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="bg-white rounded-xl p-8 shadow-sm border border-yellow-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">No posts found</h2>
                            <p className="text-gray-600 mb-4">There are no published posts in this category yet.</p>
                            <Link
                                href="/blog"
                                className="inline-flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Browse All Posts
                            </Link>
                        </div>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                        <div className="flex space-x-2">
                            {currentPage > 1 && (
                                <button
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    className="px-4 py-2 bg-white border border-yellow-300 text-yellow-600 rounded-lg hover:bg-yellow-50 transition-colors"
                                >
                                    Previous
                                </button>
                            )}

                            <span className="px-4 py-2 bg-yellow-500 text-white rounded-lg">
                                Page {currentPage} of {totalPages}
                            </span>

                            {currentPage < totalPages && (
                                <button
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    className="px-4 py-2 bg-white border border-yellow-300 text-yellow-600 rounded-lg hover:bg-yellow-50 transition-colors"
                                >
                                    Next
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}