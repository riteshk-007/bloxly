'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Code, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navigation() {
    const { data: session, status } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="bg-black/95 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center group">
                        <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 p-2 rounded-xl shadow-lg group-hover:shadow-yellow-400/25 transition-all duration-300">
                            <Code className="h-8 w-8 text-black" />
                        </div>
                        <div className="ml-3">
                            <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">Bloxly</h1>

                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">


                        {status === 'loading' ? (
                            <div className="animate-pulse bg-gray-700 h-8 w-20 rounded"></div>
                        ) : session ? (
                            <>
                                <Link href="/dashboard" className="text-gray-300 hover:text-yellow-400 transition-colors font-medium">
                                    Dashboard
                                </Link>
                                <Link href="/user/blogs" className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black px-6 py-2 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-yellow-400/25">
                                    My Blogs
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/auth/signin" className="text-gray-300 hover:text-white transition-colors font-medium">Login</Link>
                                <Link href="/dashboard" className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black px-6 py-2 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-yellow-400/25">
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-400 hover:text-white p-2 rounded-lg transition-colors"
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden border-t border-gray-800">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            <a href="#features" className="block px-3 py-2 text-gray-300 hover:text-yellow-400 transition-colors">Features</a>
                            <a href="#pricing" className="block px-3 py-2 text-gray-300 hover:text-yellow-400 transition-colors">Pricing</a>
                            <Link href="/blog" className="block px-3 py-2 text-gray-300 hover:text-yellow-400 transition-colors">Blog</Link>

                            {session ? (
                                <>
                                    <Link href="/dashboard" className="block px-3 py-2 text-gray-300 hover:text-yellow-400 transition-colors">
                                        Dashboard
                                    </Link>
                                    <Link href="/user/blogs" className="block px-3 py-2 bg-yellow-400 text-black rounded-lg font-semibold mt-2">
                                        My Blogs
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link href="/auth/signin" className="block px-3 py-2 text-gray-300 hover:text-white transition-colors">Login</Link>
                                    <Link href="/dashboard" className="block px-3 py-2 bg-yellow-400 text-black rounded-lg font-semibold mt-2">
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}