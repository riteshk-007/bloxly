'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function AnalyticsPage() {
    const { data: session } = useSession();
    const [stats, setStats] = useState({
        totalPosts: 0,
        publishedPosts: 0,
        totalViews: 0,
        totalDomains: 0,
        recentPosts: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/stats');
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-yellow-500 text-xl">Loading analytics...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Analytics</h1>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-500 rounded-lg">
                            <span className="text-black text-xl">📝</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-gray-400 text-sm">Total Posts</p>
                            <p className="text-white text-2xl font-bold">{stats.totalPosts}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-500 rounded-lg">
                            <span className="text-white text-xl">🚀</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-gray-400 text-sm">Published Posts</p>
                            <p className="text-white text-2xl font-bold">{stats.publishedPosts}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-500 rounded-lg">
                            <span className="text-white text-xl">👁️</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-gray-400 text-sm">Total Views</p>
                            <p className="text-white text-2xl font-bold">{stats.totalViews}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-500 rounded-lg">
                            <span className="text-white text-xl">🌐</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-gray-400 text-sm">Total Domains</p>
                            <p className="text-white text-2xl font-bold">{stats.totalDomains}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Posts */}
            <div className="bg-gray-900 rounded-lg border border-gray-700">
                <div className="p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Recent Posts</h2>
                    {stats.recentPosts.length === 0 ? (
                        <p className="text-gray-400">No posts found. Create your first blog post!</p>
                    ) : (
                        <div className="space-y-3">
                            {stats.recentPosts.map((post) => (
                                <div key={post.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                                    <div>
                                        <h3 className="text-white font-medium">{post.title}</h3>
                                        <p className="text-gray-400 text-sm">
                                            {post.status === 'PUBLISHED' ? '🟢' : '🟡'} {post.status} •
                                            {post.views} views •
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </p>
                                        {post.domain && (
                                            <p className="text-gray-500 text-xs">Domain: {post.domain.domain}</p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-yellow-500 text-lg font-bold">{post.views}</div>
                                        <div className="text-gray-400 text-xs">views</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Performance Chart Placeholder */}
            <div className="bg-gray-900 rounded-lg border border-gray-700">
                <div className="p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Performance Overview</h2>
                    <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-600 rounded-lg">
                        <div className="text-center">
                            <span className="text-6xl">📊</span>
                            <p className="text-gray-400 mt-2">Chart visualization coming soon!</p>
                            <p className="text-gray-500 text-sm">Track your blog performance over time</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}