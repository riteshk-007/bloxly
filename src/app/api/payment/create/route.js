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
        const plans = {
            PAID_MONTHLY: { amount: 1900, currency: 'INR', domains: 3, blogs: 20, days: 28 },
            CUSTOM_30DAYS: { amount: 3000, currency: 'INR', domains: 5, blogs: 30, days: 30 }
        }

        if (!plans[planType]) {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
        }

        const plan = plans[planType]

        if (razorpay) {
            const options = {
                amount: plan.amount,
                currency: plan.currency,
                receipt: eceipt_,
                notes: {
                    userId: session.user.id,
                    planType: planType,
                    userEmail: session.user.email
                }
            }

            const order = await razorpay.orders.create(options)

            return NextResponse.json({
                success: true,
                orderId: order.id,
                amount: plan.amount,
                currency: plan.currency,
                keyId: process.env.RAZORPAY_KEY_ID,
                planDetails: plan
            })
        } else {
            const endDate = new Date()
            endDate.setDate(endDate.getDate() + plan.days)

            const updatedSubscription = await prisma.subscription.upsert({
                where: { userId: session.user.id },
                create: {
                    userId: session.user.id,
                    plan: planType,
                    status: 'ACTIVE',
                    startDate: new Date(),
                    endDate: endDate,
                    maxDomains: plan.domains,
                    maxBlogs: plan.blogs
                },
                update: {
                    plan: planType,
                    status: 'ACTIVE',
                    startDate: new Date(),
                    endDate: endDate,
                    maxDomains: plan.domains,
                    maxBlogs: plan.blogs
                }
            })

            return NextResponse.json({
                success: true,
                mode: 'development',
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
