
import Image from 'next/image';
import { format } from 'date-fns';
import { notFound } from 'next/navigation';
import { getPost } from '../../../../lib/blog-api';
import { generateBlogPostStructuredData } from '../../../../lib/structured-data';
import { ArticleJsonLd } from '../../../components/JsonLd';
import { Breadcrumbs } from '../../../components/Breadcrumbs';


export async function generateMetadata({ params }) {
    try {
        const { post } = await getPost(params.slug);
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bloxly.vercel.app';
        const year = new Date().getFullYear();
        const computedTitle = post.metaTitle || post.title;

        // Example normalization for known comparison posts
        const title = /laravel\s*vs\s*node/i.test(computedTitle)
            ? `Your Blog Title ${year}?`
            : computedTitle;

        let description = post.metaDescription || post.excerpt || '';
        if (/laravel\s*vs\s*node/i.test(computedTitle)) {
            description = 'Compare Laravel and Node.js  for web development. Detailed analysis of performance, scalability, and use cases to help you choose the right tech stack.';
        }
        const url = `${baseUrl}/blog/${post.slug}`;
        const images = post.featuredImage ? [{ url: post.featuredImage, width: 1200, height: 630, alt: title }] : [];

        return {
            title,
            description,
            keywords: Array.isArray(post.keywords) ? post.keywords : ['blog', 'Bloxly', 'articles', 'posts'],
            authors: post.author ? [{ name: post.author }] : undefined,
            alternates: { canonical: url },
            openGraph: {
                type: 'article',
                url,
                title,
                description,
                siteName: 'Bloxly',
                images,
                publishedTime: post.publishedAt || undefined,
                modifiedTime: post.updatedAt || undefined,
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: images.length ? [images[0].url] : undefined,
            },
            robots: {
                index: true,
                follow: true,
                googleBot: {
                    index: true,
                    follow: true,
                    'max-video-preview': -1,
                    'max-image-preview': 'large',
                    'max-snippet': -1,
                },
            },
        };
    } catch {
        return {};
    }
}

export default async function BlogPost({ params }) {
    let data;
    try {
        data = await getPost(params.slug);
    } catch {
        notFound();
    }

    const { post, relatedPosts } = data;

    const structuredData = generateBlogPostStructuredData({
        ...post,
        author: post.author || post.domain?.user?.name || 'Author',
    });

    return (
        <>
            {/* JSON-LD for SEO */}
            <ArticleJsonLd post={post} />

            <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12" itemScope itemType="https://schema.org/BlogPosting">
                <Breadcrumbs items={[
                    { name: 'Home', href: '/' },
                    { name: 'Blog', href: '/blog' },
                    { name: post.title },
                ]} />
                {post.featuredImage && (
                    <div className="mb-6 sm:mb-8">
                        <div className="relative w-full aspect-[16/9] overflow-hidden rounded-lg bg-gray-100">
                            <Image
                                src={post.featuredImage}
                                alt={post.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 800px"
                                priority
                            />
                        </div>
                    </div>
                )}

                <header className="mb-6 sm:mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{post.title}</h1>
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 text-sm text-gray-600">
                        {post.author && <span>{post.author}</span>}
                        {post.publishedAt && (
                            <>
                                <span className="hidden sm:inline">•</span>
                                <time dateTime={post.publishedAt}>{format(new Date(post.publishedAt), 'MMMM dd, yyyy')}</time>
                            </>
                        )}
                        {Number.isFinite(post.views) && (
                            <>
                                <span className="hidden sm:inline">•</span>
                                <span>{post.views} views</span>
                            </>
                        )}
                    </div>
                    {post.category && (
                        <div className="mt-3">
                            <span className="inline-block rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                                {post.category.name}
                            </span>
                        </div>
                    )}
                    {post.tags?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {post.tags.map((tag) => (
                                <span key={tag.id} className="inline-block rounded bg-gray-200 px-2 py-1 text-xs text-gray-800">
                                    #{tag.name}
                                </span>
                            ))}
                        </div>
                    )}
                </header>

                <div className="prose prose-lg max-w-none dark:prose-invert">
                    {/* TipTap content */}
                    <div dangerouslySetInnerHTML={{ __html: post.content || '' }} />
                </div>

                {Array.isArray(relatedPosts) && relatedPosts.length > 0 && (
                    <section className="mt-12 border-t pt-8">
                        <h2 className="mb-4 text-xl font-semibold">Related posts</h2>
                        <ul className="grid gap-6 sm:grid-cols-2">
                            {relatedPosts.map((rp) => (
                                <li key={rp.id} className="group">
                                    <a href={`/blog/${rp.slug}`} className="block">
                                        {rp.featuredImage && (
                                            <div className="relative mb-2 aspect-[16/9] overflow-hidden rounded bg-gray-100">
                                                <Image
                                                    src={rp.featuredImage}
                                                    alt={rp.title}
                                                    fill
                                                    className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                                                    sizes="(max-width: 640px) 100vw, 50vw"
                                                />
                                            </div>
                                        )}
                                        <h3 className="text-lg font-medium leading-snug line-clamp-2">{rp.title}</h3>
                                        {rp.category?.name && (
                                            <div className="mt-1 text-xs text-gray-600">{rp.category.name}</div>
                                        )}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </article>
        </>
    );
}
