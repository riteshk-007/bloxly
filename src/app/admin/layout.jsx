'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import AdminSidebar from '../../components/AdminSidebar';

export default function AdminLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-red-500 text-xl">Loading admin panel...</div>
            </div>
        );
    }

    if (!session || session?.user?.role !== 'ADMIN') {
        redirect('/auth/signin');
    }

    return (
        <div className="min-h-screen bg-black">
            <div className="flex h-screen">
                {/* Sidebar */}
                <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
                    {/* Header */}
                    <header className="bg-gray-900 border-b border-gray-700 px-4 py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="lg:hidden p-2 text-gray-400 hover:text-white"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                                <h1 className="text-xl font-semibold text-white">
                                    Admin Dashboard
                                </h1>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="hidden md:flex items-center space-x-2 text-gray-300">
                                    <span>Welcome, {session?.user?.name}</span>
                                    <span className="bg-red-600 text-white px-2 py-1 rounded text-xs">ADMIN</span>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="flex-1 overflow-auto bg-black p-6">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}