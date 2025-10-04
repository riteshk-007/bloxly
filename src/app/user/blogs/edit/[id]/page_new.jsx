'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import BlogFormEditor from '../../../../../components/BlogFormEditor';

export default function EditBlogPage({ params }) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'loading') return;

        if (!session) {
            router.push('/auth/signin');
            return;
        }
    }, [session, status, router]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (!session) return null;

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <div className="border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/user/blogs"
                                className="text-gray-400 hover:text-yellow-500 transition-colors"
                            >
                                <ArrowLeft className="h-6 w-6" />
                            </Link>
                            <h1 className="text-3xl font-bold text-white">Edit Blog Post</h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Editor */}
            <BlogFormEditor
                postId={params.id}
                redirectPath="/user/blogs"
                onSuccess={(result) => {
                    console.log('Post updated successfully:', result);
                }}
            />
        </div>
    );
}