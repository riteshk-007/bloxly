import { NextResponse } from 'next/server'
import crypto from 'crypto'
import prisma from '../../../../../lib/prisma'

export async function POST(req) {
    try {
        const body = await req.text()
        const signature = req.headers.get('x-razorpay-signature')

        // Skip signature verification in development
        if (process.env.RAZORPAY_WEBHOOK_SECRET) {
            // Verify webhook signature
            const expectedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
                .update(body)
                .digest('hex')

            if (signature !== expectedSignature) {
                return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
            }
        }

        const event = JSON.parse(body)

        if (event.event === 'payment.captured') {
            const payment = event.payload.payment.entity

            // Update subscription with payment details
            const subscription = await prisma.subscription.findFirst({
                where: { razorpayOrderId: payment.order_id },
            })

            if (subscription) {
                // Calculate end date based on plan type
                let endDate = new Date();
                if (subscription.planType === 'PAID_MONTHLY') {
                    endDate.setDate(endDate.getDate() + 28); // 28 days
                } else if (subscription.planType === 'CUSTOM_30DAYS') {
                    endDate.setDate(endDate.getDate() + 30); // 30 days
                }

                await prisma.subscription.update({
                    where: { id: subscription.id },
                    data: {
                        razorpayPaymentId: payment.id,
                        status: 'ACTIVE',
                        startDate: new Date(),
                        endDate: endDate,
                    },
                })

                console.log('✅ Subscription activated for user:', subscription.userId)
            }
        }

        return NextResponse.json({ status: 'ok' })
    } catch (error) {
        console.error('Webhook error:', error)
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        )
    }
}