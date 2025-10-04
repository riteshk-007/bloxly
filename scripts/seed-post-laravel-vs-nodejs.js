// Seed a published blog post with slug 'laravel-vs-nodejs-which-is-best-for-web-development'
// Also ensures a Domain exists that matches NEXT_PUBLIC_BLOG_API_KEY so the public API works.

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

try {
    // Prefer dotenv if present
    require('dotenv').config({ path: path.join(process.cwd(), '.env.local') });
    require('dotenv').config();
} catch (_) {
    // Fallback manual parse
    const files = ['.env.local', '.env'];
    for (const f of files) {
        const p = path.join(process.cwd(), f);
        if (!fs.existsSync(p)) continue;
        const txt = fs.readFileSync(p, 'utf8');
        for (const line of txt.split(/\r?\n/)) {
            const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
            if (!m) continue;
            const key = m[1];
            let val = m[2].trim();
            if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
            if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
            if (process.env[key] == null) process.env[key] = val;
        }
    }
}

const prisma = new PrismaClient();

async function main() {
    const apiKey = process.env.NEXT_PUBLIC_BLOG_API_KEY;
    if (!apiKey) {
        console.error('NEXT_PUBLIC_BLOG_API_KEY is missing in .env/.env.local');
        process.exit(1);
    }

    const adminEmail = 'seed@example.com';
    const authorName = 'Admin';

    // Ensure a user exists
    const user = await prisma.user.upsert({
        where: { email: adminEmail },
        update: { name: authorName },
        create: { email: adminEmail, name: authorName },
    });

    // Ensure a domain exists for the API key
    const domain = await prisma.domain.upsert({
        where: { apiKey },
        update: { isActive: true, description: 'Seed domain' },
        create: {
            apiKey,
            domain: 'localhost',
            isActive: true,
            userId: user.id,
            description: 'Local seed domain',
        },
    });

    // Category and tags for this user
    const category = await prisma.category.upsert({
        where: { slug_userId: { slug: 'web-development', userId: user.id } },
        update: {},
        create: { name: 'Web Development', slug: 'web-development', userId: user.id },
    });

    const laravelTag = await prisma.tag.upsert({
        where: { slug_userId: { slug: 'laravel', userId: user.id } },
        update: {},
        create: { name: 'Laravel', slug: 'laravel', userId: user.id },
    });
    const nodeTag = await prisma.tag.upsert({
        where: { slug_userId: { slug: 'nodejs', userId: user.id } },
        update: {},
        create: { name: 'Node.js', slug: 'nodejs', userId: user.id },
    });

    const slug = 'laravel-vs-nodejs-which-is-best-for-web-development';
    const title = 'Laravel vs Node.js: Which Is Best for Web Development?';
    const excerpt = 'Comparing Laravel and Node.js across performance, ecosystem, learning curve, and use cases to help you choose the right stack.';

    const content = `
    <h2>Introduction</h2>
    <p>Choosing between <strong>Laravel</strong> (PHP) and <strong>Node.js</strong> (JavaScript runtime) depends on your team skills, performance needs, and project goals.</p>
    <h3>Performance</h3>
    <ul>
      <li>Node.js excels at real-time, I/O-heavy workloads with non-blocking architecture.</li>
      <li>Laravel offers great developer velocity and batteries-included tooling for CRUD apps.</li>
    </ul>
    <h3>Ecosystem</h3>
    <p>Laravel ships with first-class features (Eloquent ORM, queues, mail). Node.js has a vast NPM ecosystem and frameworks like Express, NestJS, and Next.js.</p>
    <h3>When to choose which?</h3>
    <ul>
      <li>Pick <strong>Node.js</strong> for real-time apps, streaming, microservices, or a JS-only stack.</li>
      <li>Pick <strong>Laravel</strong> for classic monoliths, admin panels, and fast CRUD with opinionated tooling.</li>
    </ul>
    <p><em>Tip:</em> You can also combine them: Laravel for backend CMS/API and Next.js for frontend.</p>
  `;

    const post = await prisma.post.upsert({
        where: { slug },
        update: {
            title,
            excerpt,
            content,
            status: 'PUBLISHED',
            metaTitle: title,
            metaDescription: excerpt,
            keywords: ['laravel', 'nodejs', 'web development', 'comparison'],
            author: authorName,
            publishedAt: new Date(),
            categoryId: category.id,
            domainId: domain.id,
        },
        create: {
            title,
            slug,
            excerpt,
            content,
            status: 'PUBLISHED',
            metaTitle: title,
            metaDescription: excerpt,
            keywords: ['laravel', 'nodejs', 'web development', 'comparison'],
            author: authorName,
            publishedAt: new Date(),
            categoryId: category.id,
            domainId: domain.id,
            tags: { connect: [{ id: laravelTag.id }, { id: nodeTag.id }] },
        },
    });

    console.log('✅ Seeded post:', post.slug);
    console.log('Open:', `http://localhost:3000/blog/${post.slug}`);
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
