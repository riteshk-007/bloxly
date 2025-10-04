import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '../../../../../lib/prisma';

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.role || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const domains = await prisma.domain.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true
                    }
                },
                posts: true,
                _count: {
                    select: {
                        posts: true,
                        requests: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(domains);

    } catch (error) {
        console.error('Admin domains fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch domains' },
            { status: 500 }
        );
    }
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.role || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { domain: domainField, name, userId, description } = await req.json();

        // Accept either 'domain' or 'name' field
        const domainName = domainField || name;

        if (!domainName || !userId) {
            return NextResponse.json({ error: 'Domain name and user ID required' }, { status: 400 });
        }

        // Check if domain already exists
        const existingDomain = await prisma.domain.findUnique({
            where: { domain: domainName }
        });

        if (existingDomain) {
            return NextResponse.json({ error: 'Domain already exists' }, { status: 400 });
        }

        // Generate API key
        const apiKey = `${domainName}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

        // Create domain
        const newDomain = await prisma.domain.create({
            data: {
                domain: domainName,
                apiKey,
                userId,
                description: description || null,
                isActive: true
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true
                    }
                }
            }
        });

        return NextResponse.json(newDomain);

    } catch (error) {
        console.error('Admin domain creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create domain' },
            { status: 500 }
        );
    }
}
