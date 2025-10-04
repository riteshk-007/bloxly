export function ArticleJsonLd({ post }) {
    if (!post) return null;
    const schema = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Article',
                '@id': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bloxly.vercel.app/'}/blog/${post.slug}/#article`,
                headline: post.title,
                description: post.excerpt,
                image: post.featuredImage
                    ? {
                        '@type': 'ImageObject',
                        url: post.featuredImage,
                        width: 1200,
                        height: 630,
                    }
                    : undefined,
                datePublished: post.publishedAt || post.publishedDate,
                dateModified: post.updatedAt || post.modifiedDate,
                author: post.author
                    ? {
                        '@type': 'Person',
                        name: post.author,
                        url: post.authorSlug
                            ? `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bloxly.vercel.app/'}/author/${post.authorSlug}`
                            : undefined,
                    }
                    : undefined,
                publisher: {
                    '@type': 'Organization',
                    name: 'Bloxly',
                    logo: {
                        '@type': 'ImageObject',
                        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bloxly.vercel.app/'}/logo.png`,
                    },
                },
                mainEntityOfPage: {
                    '@type': 'WebPage',
                    '@id': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bloxly.vercel.app/'}/blog/${post.slug}/`,
                },
                wordCount: post.wordCount,
                articleSection: post?.category?.name || post.category,
            },
            {
                '@type': 'BreadcrumbList',
                '@id': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bloxly.vercel.app/'}/blog/${post.slug}/#breadcrumb`,
                itemListElement: [
                    {
                        '@type': 'ListItem',
                        position: 1,
                        name: 'Home',
                        item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bloxly.vercel.app/'}`,
                    },
                    {
                        '@type': 'ListItem',
                        position: 2,
                        name: 'Blog',
                        item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bloxly.vercel.app/'}/blog`,
                    },
                    {
                        '@type': 'ListItem',
                        position: 3,
                        name: post.title,
                    },
                ],
            },
            {
                '@type': 'WebSite',
                '@id': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bloxly.vercel.app/'}/#website`,
                url: process.env.NEXT_PUBLIC_SITE_URL || 'https://bloxly.vercel.app/',
                name: 'Bloxly',
                description: 'Multi-Domain Blog Management',
                potentialAction: {
                    '@type': 'SearchAction',
                    target: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bloxly.vercel.app/'}/search?q={search_term_string}`,
                    'query-input': 'required name=search_term_string',
                },
            },
        ],
    };

    return (
        <script
            type="application/ld+json"
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
