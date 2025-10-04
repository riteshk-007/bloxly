'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Users,
    Globe,
    FileText,
    TrendingUp,
    Settings,
    DollarSign,
    BarChart3,
    Shield,
    LogOut
} from 'lucide-react';

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalDomains: 0,
        totalPosts: 0,
        activeSubscriptions: 0
    });

    useEffect(() => {
        if (status === 'loading') return;

        if (!session?.user?.role || session.user.role !== 'ADMIN') {
            router.push('/auth/signin');
            return;
        }

        fetchStats();
        setLoading(false);
    }, [session, status, router]);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/admin/stats');
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    if (!session?.user?.role || session.user.role !== 'ADMIN') {
        return null;
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <div className="border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                            <p className="text-gray-400 mt-1">Welcome back, {session.user.name || session.user.email}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/"
                                className="text-gray-400 hover:text-yellow-500 transition-colors"
                            >
                                View Site
                            </Link>
                            <button
                                onClick={() => signOut()}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                        <div className="flex items-center">
                            <Users className="h-8 w-8 text-yellow-500" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-400">Total Users</p>
                                <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                        <div className="flex items-center">
                            <Globe className="h-8 w-8 text-yellow-500" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-400">Total Domains</p>
                                <p className="text-2xl font-bold text-white">{stats.totalDomains}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                        <div className="flex items-center">
                            <FileText className="h-8 w-8 text-yellow-500" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-400">Total Posts</p>
                                <p className="text-2xl font-bold text-white">{stats.totalPosts}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                        <div className="flex items-center">
                            <DollarSign className="h-8 w-8 text-yellow-500" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-400">Active Subscriptions</p>
                                <p className="text-2xl font-bold text-white">{stats.activeSubscriptions}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Management Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Link href="/admin/users" className="block">
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 hover:border-yellow-500 transition-all duration-200 hover:transform hover:scale-105">
                            <Users className="h-8 w-8 text-yellow-500 mb-3" />
                            <h3 className="text-lg font-bold text-white mb-2">User Management</h3>
                            <p className="text-gray-400">Manage all users, roles, and permissions</p>
                        </div>
                    </Link>

                    <Link href="/admin/domains" className="block">
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 hover:border-yellow-500 transition-all duration-200 hover:transform hover:scale-105">
                            <Globe className="h-8 w-8 text-yellow-500 mb-3" />
                            <h3 className="text-lg font-bold text-white mb-2">Domain Management</h3>
                            <p className="text-gray-400">Configure domains, API keys, and settings</p>
                        </div>
                    </Link>

                    <Link href="/admin/posts" className="block">
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 hover:border-yellow-500 transition-all duration-200 hover:transform hover:scale-105">
                            <FileText className="h-8 w-8 text-yellow-500 mb-3" />
                            <h3 className="text-lg font-bold text-white mb-2">Content Management</h3>
                            <p className="text-gray-400">Manage all blog posts and content</p>
                        </div>
                    </Link>

                    <Link href="/admin/subscriptions" className="block">
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 hover:border-yellow-500 transition-all duration-200 hover:transform hover:scale-105">
                            <DollarSign className="h-8 w-8 text-yellow-500 mb-3" />
                            <h3 className="text-lg font-bold text-white mb-2">Subscription Management</h3>
                            <p className="text-gray-400">Handle subscriptions and payments</p>
                        </div>
                    </Link>

                    <Link href="/admin/analytics" className="block">
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 hover:border-yellow-500 transition-all duration-200 hover:transform hover:scale-105">
                            <BarChart3 className="h-8 w-8 text-yellow-500 mb-3" />
                            <h3 className="text-lg font-bold text-white mb-2">Analytics</h3>
                            <p className="text-gray-400">View detailed analytics and reports</p>
                        </div>
                    </Link>

                    <Link href="/admin/settings" className="block">
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 hover:border-yellow-500 transition-all duration-200 hover:transform hover:scale-105">
                            <Settings className="h-8 w-8 text-yellow-500 mb-3" />
                            <h3 className="text-lg font-bold text-white mb-2">System Settings</h3>
                            <p className="text-gray-400">Configure system-wide settings</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
