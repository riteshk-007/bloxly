import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import slugify from 'slug';
import prisma from '../../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function PUT(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const { name } = await req.json();

        if (!name || name.trim().length === 0) {
            return NextResponse.json({ error: 'Tag name is required' }, { status: 400 });
        }

        const cleanName = name.trim();
        const slug = slugify(cleanName, { lower: true });

        // Check if tag exists and belongs to user
        const existingTag = await prisma.tag.findUnique({
            where: { id },
            include: {
                user: true,
                _count: { select: { posts: true } }
            }
        });

        if (!existingTag) {
            return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
        }

        // Check if user owns this tag
        if (existingTag.userId !== session.user.id) {
            return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
        } const tag = await prisma.tag.update({
            where: { id },
            data: { name: cleanName, slug }
        });

        return NextResponse.json({
            success: true,
            tag
        });
    } catch (error) {
        console.error('Tag update error:', error);
        return NextResponse.json({
            error: 'Failed to update tag',
            details: error.message
        }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;

        // Check if tag exists and belongs to user
        const existingTag = await prisma.tag.findUnique({
            where: { id },
            include: {
                user: true,
                _count: { select: { posts: true } }
            }
        });

        if (!existingTag) {
            return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
        }

        // Check if user owns this tag
        if (existingTag.userId !== session.user.id) {
            return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
        } if (existingTag._count.posts > 0) {
            return NextResponse.json({
                error: 'Cannot delete tag with existing posts'
            }, { status: 400 });
        }

        await prisma.tag.delete({
            where: { id }
        });

        return NextResponse.json({
            success: true,
            message: 'Tag deleted successfully'
        });
    } catch (error) {
        console.error('Tag deletion error:', error);
        return NextResponse.json({
            error: 'Failed to delete tag',
            details: error.message
        }, { status: 500 });
    }
}