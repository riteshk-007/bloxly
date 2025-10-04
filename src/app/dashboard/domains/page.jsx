'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function UserDomainsPage() {
    const [domains, setDomains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newDomain, setNewDomain] = useState({ domain: '', description: '' });

    useEffect(() => {
        fetchDomains();
    }, []);

    const fetchDomains = async () => {
        try {
            const response = await fetch('/api/user/domains');
            if (response.ok) {
                const data = await response.json();
                setDomains(data);
            }
        } catch (error) {
            console.error('Error fetching domains:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddDomain = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/user/domains', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newDomain),
            });

            if (response.ok) {
                setNewDomain({ domain: '', description: '' });
                setShowAddForm(false);
                fetchDomains();
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to add domain');
            }
        } catch (error) {
            console.error('Error adding domain:', error);
            alert('Failed to add domain');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-yellow-500 text-xl">Loading domains...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">My Domains</h1>
                    <p className="text-gray-400 mt-2">Manage your registered domains and API keys</p>
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                    Add Domain
                </button>
            </div>

            {/* Add Domain Form */}
            {showAddForm && (
                <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <h2 className="text-xl font-semibold text-white mb-4">Add New Domain</h2>
                    <form onSubmit={handleAddDomain} className="space-y-4">
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Domain Name
                            </label>
                            <input
                                type="text"
                                value={newDomain.domain}
                                onChange={(e) => setNewDomain({ ...newDomain, domain: e.target.value })}
                                placeholder="example.com"
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Description (Optional)
                            </label>
                            <textarea
                                value={newDomain.description}
                                onChange={(e) => setNewDomain({ ...newDomain, description: e.target.value })}
                                placeholder="Brief description of this domain"
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                                rows="3"
                            />
                        </div>
                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-semibold transition-colors"
                            >
                                Add Domain
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowAddForm(false)}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Domains List */}
            {domains.length === 0 ? (
                <div className="bg-gray-900 rounded-lg p-8 border border-gray-700 text-center">
                    <div className="text-6xl mb-4">🌐</div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Domains Yet</h3>
                    <p className="text-gray-400 mb-4">
                        Add your first domain to start managing your blogs
                    </p>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-lg font-semibold transition-colors"
                    >
                        Add Your First Domain
                    </button>
                </div>
            ) : (
                <div className="grid gap-6">
                    {domains.map((domain) => (
                        <div key={domain.id} className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-semibold text-white">{domain.domain}</h3>
                                    {domain.description && (
                                        <p className="text-gray-400 mt-1">{domain.description}</p>
                                    )}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${domain.isActive
                                        ? 'bg-green-500 text-black'
                                        : 'bg-red-500 text-white'
                                        }`}>
                                        {domain.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-gray-400 text-sm mb-1">API Key</label>
                                    <div className="flex items-center space-x-2">
                                        <code className="flex-1 bg-gray-800 px-3 py-2 rounded text-sm text-yellow-500 font-mono">
                                            {domain.apiKey}
                                        </code>
                                        <button
                                            onClick={() => navigator.clipboard.writeText(domain.apiKey)}
                                            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded transition-colors"
                                            title="Copy API Key"
                                        >
                                            📋
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-1">Total Posts</label>
                                    <div className="text-2xl font-bold text-white">
                                        {domain._count?.posts || 0}
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-4">
                                <Link
                                    href={`/dashboard/domains/${domain.id}/posts`}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    View Posts ({domain._count?.posts || 0})
                                </Link>
                                <Link
                                    href={`/dashboard/blogs/create?domain=${domain.id}`}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    Create Post
                                </Link>
                                <Link
                                    href={`/dashboard/seo-guide?domain=${domain.id}`}
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    SEO Guide
                                </Link>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-700 text-sm text-gray-400">
                                <div className="flex justify-between">
                                    <span>Created: {new Date(domain.createdAt).toLocaleDateString()}</span>
                                    <span>Rate Limit: {domain.rateLimit || 100}/hour</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}