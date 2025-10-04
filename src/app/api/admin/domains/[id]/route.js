import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import prisma from '../../../../../../lib/prisma';
import { deleteR2ObjectByKey, keyFromPublicUrl } from '../../../../../../lib/r2';

export async function PATCH(req, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.role || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();

        const domain = await prisma.domain.update({
            where: { id: params.id },
            data: {
                isActive: body.isActive,
                rateLimit: body.rateLimit || undefined,
                description: body.description || undefined
            }
        });

        return NextResponse.json(domain);
    } catch (error) {
        console.error('Admin domain update error:', error);
        return NextResponse.json(
            { error: 'Failed to update domain' },
            { status: 500 }
        );
    }
}

export async function DELETE(req, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.role || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Gather images and posts for cleanup
        const [images, posts] = await Promise.all([
            prisma.image.findMany({ where: { domainId: params.id }, select: { id: true, url: true, key: true } }),
            prisma.post.findMany({ where: { domainId: params.id }, select: { id: true, featuredImage: true, images: true, content: true } })
        ]);

        // Delete R2 objects for images table
        for (const img of images) {
            const key = img.key || keyFromPublicUrl(img.url);
            if (key) await deleteR2ObjectByKey(key);
        }

        // Delete R2 objects referenced from posts (featured + gallery + embedded)
        const extract = (html) => {
            if (!html) return [];
            const set = new Set();
            const re = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
            let m; while ((m = re.exec(html)) !== null) { if (m[1]) set.add(m[1]); }
            return Array.from(set);
        };
        for (const p of posts) {
            const urls = new Set([
                ...(p.featuredImage ? [p.featuredImage] : []),
                ...(Array.isArray(p.images) ? p.images : []),
                ...extract(p.content),
            ]);
            for (const url of urls) {
                const key = keyFromPublicUrl(url);
                if (key) await deleteR2ObjectByKey(key);
            }
        }

        // Delete DB rows: images, posts, then the domain
        await prisma.image.deleteMany({ where: { domainId: params.id } });
        await prisma.post.deleteMany({ where: { domainId: params.id } });
        await prisma.domain.delete({ where: { id: params.id } });

        return NextResponse.json({ message: 'Domain deleted successfully' });
    } catch (error) {
        console.error('Admin domain delete error:', error);
        return NextResponse.json(
            { error: 'Failed to delete domain' },
            { status: 500 }
        );
    }
}
