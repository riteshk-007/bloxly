import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import crypto from 'crypto';

export async function GET() {
    try {
        // Create default admin user if not exists
        const adminUser = await prisma.user.upsert({
            where: { email: 'admin@localhost.dev' },
            update: {},
            create: {
                email: 'admin@localhost.dev',
                name: 'Admin User',
                role: 'ADMIN',
            },
        });

        // Create default subscription for admin
        await prisma.subscription.upsert({
            where: { userId: adminUser.id },
            update: {},
            create: {
                userId: adminUser.id,
                planType: 'CUSTOM_30DAYS',
                domainsAllowed: 10,
                blogsPerDomain: 100,
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            },
        });

        const devDomain = await prisma.domain.upsert({
            where: { domain: 'localhost' },
            update: { isActive: true },
            create: {
                domain: 'localhost',
                apiKey: 'blog_dev_local_123456789',
                isActive: true,
                rateLimit: 9999,
                description: 'Development',
                userId: adminUser.id,
            },
        });

        return NextResponse.json({
            success: true,
            apiKey: devDomain.apiKey,
            message: 'Copy this API key to .env.local as NEXT_PUBLIC_BLOG_API_KEY'
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}