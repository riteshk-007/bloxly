export function generateBlogPostStructuredData(post) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        image: post.featuredImage,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt,
        author: {
            '@type': 'Person',
            name: post.author
        },
        publisher: {
            '@type': 'Organization',
            name: 'Bloxly',
            logo: {
                '@type': 'ImageObject',
                url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bloxly.vercel.app'}/logo.png`
            }
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bloxly.vercel.app'}/blog/${post.slug}`
        }
    };
}