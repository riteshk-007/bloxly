'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

const UserSidebar = ({ isOpen, setIsOpen }) => {
    const { data: session } = useSession();
    const pathname = usePathname();

    const menuItems = [
        {
            name: 'Dashboard',
            href: '/dashboard',
            icon: '📊'
        },
        {
            name: 'My Domains',
            href: '/dashboard/domains',
            icon: '🌐'
        },
        {
            name: 'All Blogs',
            href: '/dashboard/blogs',
            icon: '📝'
        },
        {
            name: 'Create Blog',
            href: '/dashboard/blogs/create',
            icon: '➕'
        },
        {
            name: 'Categories',
            href: '/dashboard/categories',
            icon: '📂'
        },
        {
            name: 'Tags',
            href: '/dashboard/tags',
            icon: '🏷️'
        },
        {
            name: 'Analytics',
            href: '/dashboard/analytics',
            icon: '📈'
        },
        {
            name: 'Subscription',
            href: '/dashboard/subscription',
            icon: '💳'
        },
        {
            name: 'Profile',
            href: '/dashboard/profile',
            icon: '👤'
        },
        {
            name: 'SEO Guide',
            href: '/dashboard/seo-guide',
            icon: '🔍'
        }
    ];

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-700">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                                <span className="text-black font-bold">B</span>
                            </div>
                            <span className="text-white font-semibold">Blog Manager</span>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="lg:hidden text-gray-400 hover:text-white"
                        >
                            ✕
                        </button>
                    </div>

                    {/* User Info */}
                    <div className="p-4 border-b border-gray-700">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                                <span className="text-black font-bold">
                                    {session?.user?.name?.[0] || 'U'}
                                </span>
                            </div>
                            <div>
                                <p className="text-white font-medium">
                                    {session?.user?.name || 'User'}
                                </p>
                                <p className="text-gray-400 text-sm">
                                    {session?.user?.email}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2">
                        {menuItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                  flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
                  ${pathname === item.href
                                        ? 'bg-yellow-500 text-black'
                                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                    }
                `}
                            >
                                <span className="text-lg">{item.icon}</span>
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-700">
                        <Link
                            href="/api/auth/signout"
                            className="flex items-center space-x-3 px-3 py-2 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                        >
                            <span className="text-lg">🚪</span>
                            <span className="font-medium">Logout</span>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UserSidebar;