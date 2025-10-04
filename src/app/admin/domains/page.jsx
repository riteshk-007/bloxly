'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    Search,
    Globe,
    Key,
    ToggleLeft,
    ToggleRight,
    Edit3,
    Trash2,
    Copy,
    Eye,
    EyeOff,
    Calendar,
    User,
    FileText
} from 'lucide-react';

export default function AdminDomains() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [domains, setDomains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showApiKeys, setShowApiKeys] = useState({});

    useEffect(() => {
        if (status === 'loading') return;

        if (!session?.user?.role || session.user.role !== 'ADMIN') {
            router.push('/auth/signin');
            return;
        }

        fetchDomains();
    }, [session, status, router]);

    const fetchDomains = async () => {
        try {
            const response = await fetch('/api/admin/domains');
            if (response.ok) {
                const data = await response.json();
                setDomains(data);
            }
        } catch (error) {
            console.error('Failed to fetch domains:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleDomainStatus = async (domainId, currentStatus) => {
        try {
            const response = await fetch(`/api/admin/domains/${domainId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !currentStatus })
            });

            if (response.ok) {
                fetchDomains();
            }
        } catch (error) {
            console.error('Failed to toggle domain status:', error);
        }
    };

    const deleteDomain = async (domainId) => {
        if (!confirm('Are you sure you want to delete this domain? This will also delete all associated posts.')) return;

        try {
            const response = await fetch(`/api/admin/domains/${domainId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchDomains();
            }
        } catch (error) {
            console.error('Failed to delete domain:', error);
        }
    };

    const copyApiKey = (apiKey) => {
        navigator.clipboard.writeText(apiKey);
        // You can add a toast notification here
    };

    const toggleApiKeyVisibility = (domainId) => {
        setShowApiKeys(prev => ({
            ...prev,
            [domainId]: !prev[domainId]
        }));
    };

    const filteredDomains = domains.filter(domain =>
        domain.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
        domain.user?.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                        <h1 className="text-3xl font-bold text-white">Domain Management</h1>
                    </div>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Search domains..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-800 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
                        />
                    </div>
                </div>

                {/* Domains Table */}
                <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Domain
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Owner
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        API Key
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Posts
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Status
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
                                {filteredDomains.map((domain) => (
                                    <tr key={domain.id} className="hover:bg-gray-800">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Globe className="h-5 w-5 text-yellow-500 mr-3" />
                                                <div>
                                                    <div className="text-sm font-medium text-white">
                                                        {domain.domain}
                                                    </div>
                                                    {domain.description && (
                                                        <div className="text-xs text-gray-400">
                                                            {domain.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <User className="h-4 w-4 text-gray-400 mr-2" />
                                                <div>
                                                    <div className="text-sm text-white">{domain.user?.name || 'No name'}</div>
                                                    <div className="text-xs text-gray-400">{domain.user?.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-2">
                                                <div className="flex items-center bg-gray-800 rounded px-2 py-1">
                                                    <Key className="h-3 w-3 text-gray-400 mr-1" />
                                                    <code className="text-xs text-gray-300">
                                                        {showApiKeys[domain.id]
                                                            ? domain.apiKey
                                                            : `${domain.apiKey.substring(0, 8)}...`
                                                        }
                                                    </code>
                                                </div>
                                                <button
                                                    onClick={() => toggleApiKeyVisibility(domain.id)}
                                                    className="text-gray-400 hover:text-yellow-500"
                                                >
                                                    {showApiKeys[domain.id] ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => copyApiKey(domain.apiKey)}
                                                    className="text-gray-400 hover:text-yellow-500"
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <FileText className="h-4 w-4 text-gray-400 mr-1" />
                                                <span className="text-sm text-gray-300">{domain.posts?.length || 0}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => toggleDomainStatus(domain.id, domain.isActive)}
                                                className="flex items-center space-x-2"
                                            >
                                                {domain.isActive ? (
                                                    <>
                                                        <ToggleRight className="h-5 w-5 text-green-500" />
                                                        <span className="text-green-500 text-sm">Active</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <ToggleLeft className="h-5 w-5 text-red-500" />
                                                        <span className="text-red-500 text-sm">Inactive</span>
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            <div className="flex items-center">
                                                <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                                                {new Date(domain.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <button className="text-yellow-500 hover:text-yellow-400">
                                                    <Edit3 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => deleteDomain(domain.id)}
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

                {filteredDomains.length === 0 && (
                    <div className="text-center py-12">
                        <Globe className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-300">No domains found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm ? 'Try adjusting your search terms.' : 'Domains will appear here once users register them.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}