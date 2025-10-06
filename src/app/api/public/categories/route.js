import { NextResponse } from 'next/server';
import { validateApiKey } from '../../../../../lib/api-auth';
import prisma from '../../../../../lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;


export async function GET(req) {
    const auth = await validateApiKey(req);

    if (!auth.valid) {
        return NextResponse.json(
            { error: auth.error },
            { status: auth.status }
        );
    }

    try {
        // Categories are user-scoped in schema; expose only those that are used by this domain
        const categories = await prisma.category.findMany({
            where: {
                userId: auth.domain.userId,
                posts: {
                    some: { domainId: auth.domain.id, status: 'PUBLISHED' }
                }
            },
            include: {
                _count: {
                    select: {
                        posts: {
                            where: { status: 'PUBLISHED', domainId: auth.domain.id }
                        }
                    }
                }
            },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json({ categories }, {
            headers: {
                'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
                'Vary': 'x-api-key',
            }
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}
