import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // Create Categories
    const tech = await prisma.category.upsert({
        where: { slug: 'technology' },
        update: {},
        create: {
            name: 'Technology',
            slug: 'technology',
        },
    });

    const lifestyle = await prisma.category.upsert({
        where: { slug: 'lifestyle' },
        update: {},
        create: {
            name: 'Lifestyle',
            slug: 'lifestyle',
        },
    });

    const business = await prisma.category.upsert({
        where: { slug: 'business' },
        update: {},
        create: {
            name: 'Business',
            slug: 'business',
        },
    });

    // Create Tags
    const jsTag = await prisma.tag.upsert({
        where: { slug: 'javascript' },
        update: {},
        create: {
            name: 'JavaScript',
            slug: 'javascript',
        },
    });

    const reactTag = await prisma.tag.upsert({
        where: { slug: 'react' },
        update: {},
        create: {
            name: 'React',
            slug: 'react',
        },
    });

    const nextjsTag = await prisma.tag.upsert({
        where: { slug: 'nextjs' },
        update: {},
        create: {
            name: 'Next.js',
            slug: 'nextjs',
        },
    });

    // Create Sample Posts
    const post1 = await prisma.post.upsert({
        where: { slug: 'getting-started-with-nextjs' },
        update: {},
        create: {
            title: 'Getting Started with Next.js 14',
            slug: 'getting-started-with-nextjs',
            excerpt: 'Learn how to build modern web applications with Next.js 14',
            content: `
        <h2>Introduction to Next.js</h2>
        <p>Next.js is a powerful React framework that makes building web applications easier and faster.</p>
        
        <h3>Key Features</h3>
        <ul>
          <li>Server-side rendering</li>
          <li>Static site generation</li>
          <li>API routes</li>
          <li>Built-in optimization</li>
        </ul>
        
        <h3>Installation</h3>
        <pre><code>pnpm create next-app@latest my-app</code></pre>
        
        <p>This command will create a new Next.js project with all the necessary dependencies.</p>
      `,
            status: 'PUBLISHED',
            metaTitle: 'Getting Started with Next.js 14 - Complete Guide',
            metaDescription: 'A comprehensive guide to getting started with Next.js 14, covering installation, features, and best practices.',
            keywords: ['nextjs', 'react', 'web development', 'tutorial'],
            author: 'Admin',
            categoryId: tech.id,
            tags: {
                connect: [{ id: nextjsTag.id }, { id: reactTag.id }],
            },
            publishedAt: new Date(),
        },
    });

    const post2 = await prisma.post.upsert({
        where: { slug: 'building-blog-with-prisma' },
        update: {},
        create: {
            title: 'Building a Blog with Prisma and PostgreSQL',
            slug: 'building-blog-with-prisma',
            excerpt: 'Step-by-step guide to creating a full-featured blog system',
            content: `
        <h2>Why Prisma?</h2>
        <p>Prisma is a next-generation ORM that makes database access easy and type-safe.</p>
        
        <h3>Setting Up Prisma</h3>
        <p>First, install Prisma in your project:</p>
        <pre><code>pnpm add prisma @prisma/client</code></pre>
        
        <h3>Database Schema</h3>
        <p>Define your data models in the Prisma schema file.</p>
      `,
            status: 'PUBLISHED',
            metaTitle: 'Building a Blog with Prisma - Tutorial',
            metaDescription: 'Learn how to build a modern blog system using Prisma ORM and PostgreSQL database.',
            keywords: ['prisma', 'postgresql', 'database', 'blog'],
            author: 'Admin',
            categoryId: tech.id,
            tags: {
                connect: [{ id: jsTag.id }],
            },
            publishedAt: new Date(),
        },
    });

    console.log('Database seeded successfully!');
    console.log({ tech, lifestyle, business, post1, post2 });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });