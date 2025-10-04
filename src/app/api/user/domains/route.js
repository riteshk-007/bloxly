import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import prisma from '../../../../../lib/prisma'
import { generateApiKey } from '../../../../../lib/api-auth'


export async function GET() {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const domains = await prisma.domain.findMany({
            where: { userId: session.user.id },
            include: {
                _count: {
                    select: {
                        posts: true,
                        requests: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(domains)
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch domains' },
            { status: 500 }
        )
    }
}

export async function POST(request) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { domain, description } = await request.json()

        if (!domain) {
            return NextResponse.json({ error: 'Domain is required' }, { status: 400 })
        }

        // Check user's subscription and domain limits
        const subscription = await prisma.subscription.findUnique({
            where: { userId: session.user.id }
        })

        if (!subscription || subscription.status !== 'ACTIVE') {
            return NextResponse.json({ error: 'Active subscription required' }, { status: 403 })
        }

        if (new Date() > subscription.endDate) {
            return NextResponse.json({ error: 'Subscription expired' }, { status: 403 })
        }

        // Check current domain count
        const currentDomains = await prisma.domain.count({
            where: { userId: session.user.id }
        })

        if (currentDomains >= subscription.domainsAllowed) {
            return NextResponse.json({
                error: `Domain limit reached. Your plan allows ${subscription.domainsAllowed} domains.`
            }, { status: 403 })
        }

        // Check if domain already exists
        const existingDomain = await prisma.domain.findUnique({
            where: { domain }
        })

        if (existingDomain) {
            return NextResponse.json({ error: 'Domain already registered' }, { status: 400 })
        }

        // Create domain with API key
        const apiKey = generateApiKey()

        const newDomain = await prisma.domain.create({
            data: {
                domain,
                description: description || '',
                apiKey,
                userId: session.user.id,
                isActive: true
            },
            include: {
                _count: {
                    select: {
                        posts: true,
                        requests: true
                    }
                }
            }
        })

        // Update current domains count in subscription
        await prisma.subscription.update({
            where: { userId: session.user.id },
            data: { currentDomains: currentDomains + 1 }
        })

        return NextResponse.json(newDomain)

    } catch (error) {
        console.error('Domain creation error:', error)
        return NextResponse.json(
            { error: 'Failed to create domain' },
            { status: 500 }
        )
    }
}