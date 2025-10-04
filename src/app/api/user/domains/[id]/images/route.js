import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../auth/[...nextauth]/route';
import prisma from '../../../../../../../lib/prisma';
import { normalizePublicUrl } from '../../../../../../../lib/r2';

export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const domainId = params.id;

        // Verify domain ownership
        const domain = await prisma.domain.findFirst({
            where: {
                id: domainId,
                userId: session.user.id,
            },
        });

        if (!domain) {
            return NextResponse.json({ error: 'Domain not found or unauthorized' }, { status: 403 });
        }

        // Fetch images for this domain
        const imagesRaw = await prisma.image.findMany({
            where: {
                domainId: domainId,
                userId: session.user.id,
            },
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                url: true,
                key: true,
                originalName: true,
                size: true,
                createdAt: true,
            },
        });
        const images = imagesRaw.map(i => ({ ...i, url: normalizePublicUrl(i.url) }));
        return NextResponse.json(images);

    } catch (error) {
        console.error('Error fetching domain images:', error);
        return NextResponse.json(
            { error: 'Failed to fetch images' },
            { status: 500 }
        );
    }
}