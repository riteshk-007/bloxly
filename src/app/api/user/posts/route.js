import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '../../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user's posts through their domains
        const userDomains = await prisma.domain.findMany({
            where: { userId: session.user.id },
            include: {
                posts: {
                    include: {
                        domain: {
                            select: {
                                domain: true
                            }
                        },
                        category: {
                            select: {
                                name: true,
                                slug: true
                            }
                        },
                        tags: {
                            select: {
                                id: true,
                                name: true,
                                slug: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });

        // Flatten posts from all domains
        const posts = userDomains.flatMap(domain => domain.posts);

        return NextResponse.json(posts);

    } catch (error) {
        console.error('User posts fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch posts' },
            { status: 500 }
        );
    }
}