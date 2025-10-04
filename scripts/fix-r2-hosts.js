#!/usr/bin/env node
/**
 * Fix image URLs in the database to use the configured CLOUDFLARE_R2_PUBLIC_HOST
 * Usage: node scripts/fix-r2-hosts.js
 */
import fs from 'fs';
import path from 'path';

function parseDotenv(filePath) {
    const out = {};
    if (!fs.existsSync(filePath)) return out;
    const content = fs.readFileSync(filePath, 'utf8');
    for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eq = trimmed.indexOf('=');
        if (eq === -1) continue;
        const k = trimmed.slice(0, eq).trim();
        let v = trimmed.slice(eq + 1).trim();
        // remove surrounding quotes
        if ((v.startsWith("\"") && v.endsWith("\"")) || (v.startsWith("'") && v.endsWith("'"))) {
            v = v.slice(1, -1);
        }
        out[k] = v;
    }
    return out;
}

// Prefer project root .env (when running from project root). Fall back to script-relative .env.
const envPathRoot = path.resolve(process.cwd(), '.env');
let envPath = envPathRoot;
if (!fs.existsSync(envPath)) {
    envPath = path.resolve(new URL('../.env', import.meta.url).pathname);
}
const env = parseDotenv(envPath);

const OLD_HOSTS = [
    'pub-7aa78f39585a05d49b581467ce1450c8.r2.dev',
    'pub-7aa78f39585a05d49b581467ce1450c8.r2.dev',
];

async function main() {
    const publicHostRaw = env.CLOUDFLARE_R2_PUBLIC_HOST || `https://pub-${env.CLOUDFLARE_ACCOUNT_ID}.r2.dev`;
    const publicHost = publicHostRaw.replace(/\/$/, '');
    console.log('Using public host:', publicHost);

    // Prisma client lives at /lib/prisma.js in this project
    const prismaModule = await import('../lib/prisma.js');
    const prisma = prismaModule.default || prismaModule;

    // Find images where url is not null
    // Pull urls (select everything) and filter in JS to avoid Prisma filter edge cases
    const imagesAll = await prisma.image.findMany({ select: { id: true, url: true } });
    const images = imagesAll.filter(i => i.url && !i.url.startsWith('data:'));

    let updated = 0;
    for (const img of images) {
        if (!img.url || img.url.startsWith('data:')) continue;
        try {
            const url = new URL(img.url);
            const host = url.hostname;
            if (OLD_HOSTS.includes(host)) {
                const newUrl = `${publicHost}${url.pathname}${url.search}`;
                await prisma.image.update({ where: { id: img.id }, data: { url: newUrl } });
                updated++;
                console.log(`Updated image ${img.id} -> ${newUrl}`);
            }
        } catch (e) {
            // ignore invalid urls
        }
    }

    console.log(`Done. Updated ${updated} images.`);
    await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
