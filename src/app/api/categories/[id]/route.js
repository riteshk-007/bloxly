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
            return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
        }

        const cleanName = name.trim();
        const slug = slugify(cleanName, { lower: true });

        // Check if category exists and belongs to user
        const existingCategory = await prisma.category.findUnique({
            where: { id },
            include: {
                user: true,
                _count: { select: { posts: true } }
            }
        });

        if (!existingCategory) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        // Check if user owns this category
        if (existingCategory.userId !== session.user.id) {
            return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
        } const category = await prisma.category.update({
            where: { id },
            data: { name: cleanName, slug }
        });

        return NextResponse.json({
            success: true,
            category
        });
    } catch (error) {
        console.error('Category update error:', error);
        return NextResponse.json({
            error: 'Failed to update category',
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

        // Check if category exists and belongs to user
        const existingCategory = await prisma.category.findUnique({
            where: { id },
            include: {
                user: true,
                _count: { select: { posts: true } }
            }
        });

        if (!existingCategory) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        // Check if user owns this category
        if (existingCategory.userId !== session.user.id) {
            return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
        } if (existingCategory._count.posts > 0) {
            return NextResponse.json({
                error: 'Cannot delete category with existing posts'
            }, { status: 400 });
        }

        await prisma.category.delete({
            where: { id }
        });

        return NextResponse.json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        console.error('Category deletion error:', error);
        return NextResponse.json({
            error: 'Failed to delete category',
            details: error.message
        }, { status: 500 });
    }
}