import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';


export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q') || '';

        if (!query) {
            return NextResponse.json({ posts: [] });
        }

        const posts = await prisma.post.findMany({
            where: {
                status: 'PUBLISHED',
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { content: { contains: query, mode: 'insensitive' } },
                    { excerpt: { contains: query, mode: 'insensitive' } },
                    { keywords: { has: query } }
                ]
            },
            include: {
                category: true,
                tags: true
            },
            take: 10,
            orderBy: { views: 'desc' }
        });

        return NextResponse.json({ posts });
    } catch (error) {
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
}