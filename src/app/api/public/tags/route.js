import { NextResponse } from 'next/server';
import { validateApiKey } from '../../../../../lib/api-auth';
import prisma from '../../../../../lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req) {
    const auth = await validateApiKey(req);
    if (!auth.valid) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    try {
        const tags = await prisma.tag.findMany({
            where: {
                posts: {
                    some: { domainId: auth.domain.id, status: 'PUBLISHED' },
                },
            },
            include: {
                _count: {
                    select: {
                        posts: {
                            where: { domainId: auth.domain.id, status: 'PUBLISHED' },
                        },
                    },
                },
            },
            orderBy: { slug: 'asc' },
        });

        return NextResponse.json({ tags }, {
            headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200', 'Vary': 'x-api-key' },
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
    }
}
