import { NextResponse } from 'next/server';
import { validateApiKey } from '../../../../../lib/api-auth';
import prisma from '../../../../../lib/prisma';


export async function GET(req) {
    const auth = await validateApiKey(req);

    if (!auth.valid) {
        return NextResponse.json(
            { error: auth.error },
            { status: auth.status }
        );
    }

    try {
        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: {
                        posts: {
                            where: { status: 'PUBLISHED' }
                        }
                    }
                }
            },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json({ categories }, {
            headers: {
                'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
            }
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}
