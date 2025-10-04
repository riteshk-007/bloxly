'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { format } from 'date-fns'
import {
    Plus,
    Globe,
    BarChart3,
    FileText,
    Settings,
    TrendingUp,
    Eye,
    Calendar,
    Crown,
    Zap,
    ArrowRight
} from 'lucide-react'

export default function DashboardPage() {
    const { data: session, status } = useSession()
    const [domains, setDomains] = useState([])
    const [subscription, setSubscription] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showAddDomain, setShowAddDomain] = useState(false)
    const [newDomain, setNewDomain] = useState({ domain: '', description: '' })
    const [stats, setStats] = useState({
        totalViews: 0,
        growth: 0,
        totalBlogs: 0,
        totalDomains: 0
    })

    useEffect(() => {
        if (status === 'authenticated') {
            fetchUserData()
        }
    }, [status])

    const fetchUserData = async () => {
        try {
            const [domainsRes, subscriptionRes] = await Promise.all([
                fetch('/api/user/domains'),
                fetch('/api/user/subscription')
            ])

            if (domainsRes.ok) {
                const domainsData = await domainsRes.json()
                setDomains(domainsData)

                // Calculate stats from domains data
                const totalBlogs = domainsData.reduce((acc, domain) => acc + (domain._count?.posts || 0), 0)
                const totalViews = domainsData.reduce((acc, domain) => acc + (domain._count?.requests || 0), 0)

                setStats({
                    totalDomains: domainsData.length,
                    totalBlogs,
                    totalViews,
                    growth: totalViews > 0 ? Math.round((totalViews / 100) * 10) : 0 // Simple growth calculation
                })
            }

            if (subscriptionRes.ok) {
                const subscriptionData = await subscriptionRes.json()
                setSubscription(subscriptionData)
            }
        } catch (error) {
            console.error('Failed to fetch user data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddDomain = async (e) => {
        e.preventDefault()
        try {
            // Use the user domains API (requires active subscription)
            const response = await fetch('/api/user/domains', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newDomain)
            })

            if (response.ok) {
                setShowAddDomain(false)
                setNewDomain({ domain: '', description: '' })
                fetchUserData()
            } else {
                const error = await response.json()
                alert(error.error)
            }
        } catch (error) {
            console.error('Failed to add domain:', error)
        }
    }

    // Route users to the dedicated subscription page for upgrades
    const handleUpgrade = () => {
        window.location.href = '/dashboard/subscription'
    }

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading your dashboard...</p>
                </div>
            </div>
        )
    }

    if (status === 'unauthenticated') {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
                    <p className="text-gray-400 mb-6">Please sign in to access the dashboard.</p>
                    <Link href="/auth/signin" className="bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors">
                        Sign In
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <div className="border-b border-gray-800 bg-gray-900/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                Dashboard
                            </h1>
                            <p className="text-gray-400 mt-1">Welcome back, {session.user.name}! ✨</p>
                        </div>
                        <div className="mt-4 sm:mt-0">
                            <Link href="/user/blogs/create" className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center">
                                <Plus className="w-5 h-5 mr-2" />
                                Create New Blog
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-400 text-sm font-medium">Total Domains</p>
                                <p className="text-3xl font-bold text-white">{domains.length}</p>
                            </div>
                            <div className="bg-blue-500/20 p-3 rounded-lg">
                                <Globe className="w-6 h-6 text-blue-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-400 text-sm font-medium">Active Blogs</p>
                                <p className="text-3xl font-bold text-white">{domains.reduce((acc, domain) => acc + (domain._count?.posts || 0), 0)}</p>
                            </div>
                            <div className="bg-green-500/20 p-3 rounded-lg">
                                <FileText className="w-6 h-6 text-green-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-400 text-sm font-medium">Total Views</p>
                                <p className="text-3xl font-bold text-white">{stats.totalViews || 0}</p>
                            </div>
                            <div className="bg-purple-500/20 p-3 rounded-lg">
                                <Eye className="w-6 h-6 text-purple-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-yellow-400 text-sm font-medium">Growth</p>
                                <p className="text-3xl font-bold text-white">+{stats.growth || 0}%</p>
                            </div>
                            <div className="bg-yellow-500/20 p-3 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-yellow-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subscription Status */}
                <div className="bg-gradient-to-br from-gray-900/80 to-black/60 border border-gray-800 rounded-xl p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white flex items-center">
                            <Crown className="w-6 h-6 mr-2 text-yellow-400" />
                            Subscription Status
                        </h2>
                        {subscription?.planType === 'FREE' && (
                            <button
                                onClick={handleUpgrade}
                                className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center"
                            >
                                <Zap className="w-5 h-5 mr-2" />
                                Upgrade Now
                            </button>
                        )}
                    </div>

                    {subscription ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-gray-800/50 rounded-lg p-4">
                                <p className="text-gray-400 text-sm mb-2">Current Plan</p>
                                <p className="text-xl font-bold text-white">{subscription.planType}</p>
                                {subscription.planType === 'FREE' && (
                                    <span className="inline-block bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full mt-1">
                                        Limited Features
                                    </span>
                                )}
                            </div>

                            <div className="bg-gray-800/50 rounded-lg p-4">
                                <p className="text-gray-400 text-sm mb-2">Domains Allowed</p>
                                <p className="text-xl font-bold text-white">
                                    {domains.length} / {subscription.domainsAllowed}
                                </p>
                                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                                    <div
                                        className="bg-yellow-400 h-2 rounded-full transition-all"
                                        style={{ width: `${(domains.length / subscription.domainsAllowed) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="bg-gray-800/50 rounded-lg p-4">
                                <p className="text-gray-400 text-sm mb-2">Blogs per Domain</p>
                                <p className="text-xl font-bold text-white">{subscription.blogsPerDomain}</p>

                            </div>

                            <div className="bg-gray-800/50 rounded-lg p-4">
                                <p className="text-gray-400 text-sm mb-2">Expires</p>
                                <p className="text-xl font-bold text-white">
                                    {format(new Date(subscription.endDate), 'MMM dd, yyyy')}
                                </p>
                                <div className="flex items-center mt-1">
                                    <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                                    <span className="text-gray-400 text-sm">
                                        {Math.ceil((new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24))} days left
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Crown className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400 text-lg">No subscription found</p>
                            <p className="text-gray-500 text-sm">Contact support to activate your account</p>
                        </div>
                    )}
                </div>

                {/* Domains */}
                <div className="bg-gradient-to-br from-gray-900/80 to-black/60 border border-gray-800 rounded-xl p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white flex items-center mb-4 sm:mb-0">
                            <Globe className="w-6 h-6 mr-2 text-blue-400" />
                            Your Domains
                        </h2>
                        <button
                            onClick={() => setShowAddDomain(true)}
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={subscription && domains.length >= subscription.domainsAllowed}
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Add Domain
                        </button>
                    </div>

                    {showAddDomain && (
                        <div className="mb-6 p-6 bg-gray-800/50 border border-gray-700 rounded-xl">
                            <h3 className="text-lg font-semibold text-white mb-4">Add New Domain</h3>
                            <form onSubmit={handleAddDomain}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Domain Name *
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g., myblog.com"
                                            value={newDomain.domain}
                                            onChange={(e) => setNewDomain({ ...newDomain, domain: e.target.value })}
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Description
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g., My personal blog"
                                            value={newDomain.description}
                                            onChange={(e) => setNewDomain({ ...newDomain, description: e.target.value })}
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        type="submit"
                                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                                    >
                                        Add Domain
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddDomain(false)}
                                        className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="space-y-4">
                        {domains.map((domain) => (
                            <div key={domain.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center mb-2">
                                            <h3 className="text-xl font-bold text-white mr-3">{domain.domain}</h3>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${domain.isActive
                                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                }`}>
                                                {domain.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>

                                        {domain.description && (
                                            <p className="text-gray-400 mb-3">{domain.description}</p>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            <div className="bg-gray-700/50 rounded-lg p-3">
                                                <p className="text-gray-400 text-sm">API Key</p>
                                                <p className="text-white font-mono text-sm break-all">{domain.apiKey}</p>
                                            </div>
                                            <div className="bg-gray-700/50 rounded-lg p-3">
                                                <p className="text-gray-400 text-sm">Blog Posts</p>
                                                <p className="text-white text-lg font-semibold">{domain._count?.posts || 0}</p>
                                            </div>
                                            <div className="bg-gray-700/50 rounded-lg p-3">
                                                <p className="text-gray-400 text-sm">API Requests</p>
                                                <p className="text-white text-lg font-semibold">{domain._count?.requests || 0}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3 lg:ml-6">
                                        <Link
                                            href={`/user/blogs?domain=${domain.id}`}
                                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all text-center flex items-center justify-center"
                                        >
                                            <FileText className="w-5 h-5 mr-2" />
                                            Manage Blogs
                                        </Link>
                                        <Link
                                            href={`/dashboard/seo-guide?domain=${domain.id}`}
                                            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black px-6 py-3 rounded-lg font-semibold transition-all text-center flex items-center justify-center"
                                        >
                                            <Settings className="w-5 h-5 mr-2" />
                                            SEO Guide
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {domains.length === 0 && (
                        <div className="text-center py-16">
                            <Globe className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400 text-lg mb-2">No domains added yet</p>
                            <p className="text-gray-500 text-sm mb-6">Add your first domain to start creating amazing blogs</p>
                            <button
                                onClick={() => setShowAddDomain(true)}
                                className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center mx-auto"
                                disabled={subscription && domains.length >= subscription.domainsAllowed}
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Add Your First Domain
                            </button>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                    <Link href="/user/blogs" className="group bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-6 hover:border-blue-500/40 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-blue-500/20 p-3 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                                <FileText className="w-6 h-6 text-blue-400" />
                            </div>
                            <ArrowRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Manage Blogs</h3>
                        <p className="text-gray-400 text-sm">Create, edit, and manage all your blog posts</p>
                    </Link>

                    <Link href="/dashboard/subscription" className="group bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 rounded-xl p-6 hover:border-yellow-500/40 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-yellow-500/20 p-3 rounded-lg group-hover:bg-yellow-500/30 transition-colors">
                                <Crown className="w-6 h-6 text-yellow-400" />
                            </div>
                            <ArrowRight className="w-5 h-5 text-yellow-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Subscription</h3>
                        <p className="text-gray-400 text-sm">Manage your subscription and billing</p>
                    </Link>

                    <Link href="/dashboard/analytics" className="group bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-purple-500/20 p-3 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                                <BarChart3 className="w-6 h-6 text-purple-400" />
                            </div>
                            <ArrowRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Analytics</h3>
                        <p className="text-gray-400 text-sm">Track your blog performance and growth</p>
                    </Link>
                </div>
            </div>
        </div>
    )
}