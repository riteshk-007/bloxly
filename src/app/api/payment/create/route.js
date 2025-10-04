import { NextResponse } from 'next/server'
import prisma from '../../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    const Razorpay = require('razorpay');
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { planType } = await req.json()
        // Amounts in paise for Razorpay (₹49 => 4900, ₹69 => 6900)
        const plans = {
            PAID_MONTHLY: { amount: 4900, currency: 'INR', domains: 3, blogs: 20, days: 28, priceRupees: 49 },
            CUSTOM_30DAYS: { amount: 6900, currency: 'INR', domains: 5, blogs: 30, days: 30, priceRupees: 69 }
        }

        if (!plans[planType]) {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
        }

        const plan = plans[planType]

        if (razorpay) {
            const options = {
                amount: plan.amount,
                currency: plan.currency,
                // Provide a valid unique receipt id for Razorpay orders
                receipt: `receipt_${Date.now()}`,
                notes: {
                    userId: session.user.id,
                    planType: planType,
                    userEmail: session.user.email
                }
            }

            const order = await razorpay.orders.create(options)

            // Persist a pending/placeholder subscription linked to this order
            // We'll flip it to ACTIVE on verify/webhook
            const now = new Date()
            await prisma.subscription.upsert({
                where: { userId: session.user.id },
                create: {
                    userId: session.user.id,
                    planType: planType,
                    status: 'EXPIRED', // treat as not active until payment
                    domainsAllowed: plan.domains,
                    blogsPerDomain: plan.blogs,
                    currentDomains: 0,
                    startDate: now,
                    endDate: now, // will be updated on successful verify
                    razorpayOrderId: order.id,
                    amount: plan.priceRupees
                },
                update: {
                    planType: planType,
                    status: 'EXPIRED',
                    domainsAllowed: plan.domains,
                    blogsPerDomain: plan.blogs,
                    startDate: now,
                    endDate: now,
                    razorpayOrderId: order.id,
                    amount: plan.priceRupees
                }
            })

            return NextResponse.json({
                success: true,
                orderId: order.id,
                amount: plan.amount,
                currency: plan.currency,
                // Frontend expects 'key'
                key: process.env.RAZORPAY_KEY_ID,
                planDetails: plan
            })
        } else {
            const endDate = new Date()
            endDate.setDate(endDate.getDate() + plan.days)

            const updatedSubscription = await prisma.subscription.upsert({
                where: { userId: session.user.id },
                create: {
                    userId: session.user.id,
                    planType: planType,
                    status: 'ACTIVE',
                    startDate: new Date(),
                    endDate: endDate,
                    domainsAllowed: plan.domains,
                    blogsPerDomain: plan.blogs,
                    currentDomains: 0,
                    amount: plan.priceRupees
                },
                update: {
                    planType: planType,
                    status: 'ACTIVE',
                    startDate: new Date(),
                    endDate: endDate,
                    domainsAllowed: plan.domains,
                    blogsPerDomain: plan.blogs,
                    amount: plan.priceRupees
                }
            })

            return NextResponse.json({
                success: true,
                mode: 'development',
                development: true,
                subscription: updatedSubscription,
                message: 'Subscription activated successfully'
            })
        }

    } catch (error) {
        console.error('Payment creation error:', error)
        return NextResponse.json({
            error: 'Payment creation failed',
            details: error.message
        }, { status: 500 })
    }
}
