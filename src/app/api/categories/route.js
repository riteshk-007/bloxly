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

        // Get categories created by this user
        const categories = await prisma.category.findMany({
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

        return NextResponse.json(categories);
    } catch (error) {
        console.error('Categories fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
} export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name } = await req.json();

        if (!name || name.trim().length === 0) {
            return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
        }

        const cleanName = name.trim();
        const slug = slugify(cleanName, { lower: true });

        // Check if category already exists for this user
        const existingCategory = await prisma.category.findFirst({
            where: {
                name: cleanName,
                userId: session.user.id
            }
        });

        if (existingCategory) {
            return NextResponse.json({
                success: true,
                category: existingCategory,
                isNew: false,
                message: 'Category already exists in your collection'
            });
        }

        // Create new category for this user
        const category = await prisma.category.create({
            data: {
                name: cleanName,
                slug,
                userId: session.user.id
            }
        });

        return NextResponse.json({
            success: true,
            category,
            isNew: true,
            message: 'Category created successfully'
        });
    } catch (error) {
        console.error('Category creation error:', error);
        return NextResponse.json({
            error: 'Failed to create category',
            details: error.message
        }, { status: 500 });
    }
}