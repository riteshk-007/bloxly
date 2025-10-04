import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { getPostsInternal, getCategoriesInternal } from '../../../lib/blog-api';

export const metadata = {
    title: 'Blog | Bloxly',
    description: 'Latest blog posts and tech guides from Bloxly.',
    alternates: { canonical: (process.env.NEXT_PUBLIC_SITE_URL || 'https://bloxly.vercel.app') + '/blog' },
    openGraph: {
        title: 'Blog | Bloxly',
        description: 'Latest blog posts and tech guides from Bloxly.',
        url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://bloxly.vercel.app') + '/blog',
        type: 'website'
    },
};


export default async function BlogPage() {
    const [postsData, categoriesData] = await Promise.all([
        getPostsInternal({ page: 1, limit: 12 }),
        getCategoriesInternal(),
    ]);

    const posts = postsData.posts;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-12 text-center">Latest Blog Posts</h1>

            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                    <div
                        key={post.id}
                        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
                    >
                        {post.featuredImage && (
                            <div className="relative h-48 w-full">
                                <Image
                                    src={post.featuredImage}
                                    alt={post.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}

                        <div className="p-6">
                            {post.category && (
                                <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                                    {post.category.name}
                                </span>
                            )}

                            <Link href={`/blog/${post.slug}`}>
                                <h2 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200 mb-2">
                                    {post.title}
                                </h2>
                            </Link>

                            <p className="text-sm text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>

                            <div className="text-xs text-gray-500">
                                {post.publishedAt && format(new Date(post.publishedAt), 'MMM dd, yyyy')} ·{' '}
                                {post.views} views
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
