import { NextResponse } from 'next/server';
import prisma from '../../../../../../lib/prisma';


export async function GET(
    req,
    { params }
) {
    try {
        const post = await prisma.post.findUnique({
            where: { id: params.id },
            include: { tags: true }
        });

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        const relatedPosts = await prisma.post.findMany({
            where: {
                id: { not: post.id },
                status: 'PUBLISHED',
                OR: [
                    { categoryId: post.categoryId },
                    {
                        tags: {
                            some: {
                                id: { in: post.tags.map(t => t.id) }
                            }
                        }
                    }
                ]
            },
            include: {
                category: true,
                tags: true
            },
            take: 3,
            orderBy: { views: 'desc' }
        });

        return NextResponse.json(relatedPosts);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch related posts' }, { status: 500 });
    }
}
