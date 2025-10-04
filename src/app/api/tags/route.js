import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import slugify from 'slug';
import prisma from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get tags created by this user
        const tags = await prisma.tag.findMany({
            where: {
                userId: session.user.id
            },
            include: {
                _count: {
                    select: {
                        posts: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(tags);
    } catch (error) {
        console.error('Tags fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
    }
} export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name } = await req.json();

        if (!name || name.trim().length === 0) {
            return NextResponse.json({ error: 'Tag name is required' }, { status: 400 });
        }

        const cleanName = name.trim();
        const slug = slugify(cleanName, { lower: true });

        // Check if tag already exists for this user
        const existingTag = await prisma.tag.findFirst({
            where: {
                name: cleanName,
                userId: session.user.id
            }
        });

        if (existingTag) {
            return NextResponse.json({
                success: true,
                tag: existingTag,
                isNew: false,
                message: 'Tag already exists in your collection'
            });
        }

        // Create new tag for this user
        const tag = await prisma.tag.create({
            data: {
                name: cleanName,
                slug,
                userId: session.user.id
            }
        });

        return NextResponse.json({
            success: true,
            tag,
            isNew: true,
            message: 'Tag created successfully'
        });
    } catch (error) {
        console.error('Tag creation error:', error);
        return NextResponse.json({
            error: 'Failed to create tag',
            details: error.message
        }, { status: 500 });
    }
}