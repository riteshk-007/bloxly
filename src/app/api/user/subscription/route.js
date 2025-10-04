import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '../../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let subscription = await prisma.subscription.findUnique({
            where: { userId: session.user.id },
            include: {
                user: {
                    select: {
                        domains: {
                            select: {
                                id: true,
                                domain: true,
                                isActive: true,
                                _count: {
                                    select: {
                                        posts: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!subscription) {
            // Check if user exists in database first
            const userExists = await prisma.user.findUnique({
                where: { id: session.user.id }
            });

            if (!userExists) {
                // User doesn't exist in database, return default subscription data
                return NextResponse.json({
                    planType: 'FREE',
                    status: 'ACTIVE',
                    domainsAllowed: 1,
                    blogsPerDomain: 5,
                    currentDomains: 0,
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                    user: { domains: [] }
                });
            }

            // Create default FREE subscription if user exists but no subscription
            subscription = await prisma.subscription.create({
                data: {
                    userId: session.user.id,
                    planType: 'FREE',
                    status: 'ACTIVE',
                    domainsAllowed: 1,
                    blogsPerDomain: 5,
                    currentDomains: 0,
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
                },
                include: {
                    user: {
                        select: {
                            domains: {
                                select: {
                                    id: true,
                                    domain: true,
                                    isActive: true,
                                    _count: {
                                        select: {
                                            posts: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
        }

        return NextResponse.json(subscription);
    } catch (error) {
        console.error('Error fetching subscription:', error);
        return NextResponse.json(
            { error: 'Failed to fetch subscription' },
            { status: 500 }
        );
    }
}