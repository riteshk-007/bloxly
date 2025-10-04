import { NextResponse } from 'next/server'
import prisma from '../../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import crypto from 'crypto'

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()

        // Verify Razorpay signature
        if (process.env.RAZORPAY_KEY_SECRET) {
            const body = razorpay_order_id + "|" + razorpay_payment_id
            const expectedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                .update(body.toString())
                .digest('hex')

            if (expectedSignature !== razorpay_signature) {
                console.error('❌ Payment signature verification failed')
                return NextResponse.json({
                    error: 'Payment verification failed',
                    success: false
                }, { status: 400 })
            }
        }

        // Find subscription by order ID and user ID (security check)
        const subscription = await prisma.subscription.findFirst({
            where: {
                userId: session.user.id,
                razorpayOrderId: razorpay_order_id
            }
        })

        if (!subscription) {
            return NextResponse.json({
                error: 'Subscription not found',
                success: false
            }, { status: 404 })
        }

        // Update subscription status
        const updatedSubscription = await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
                status: 'ACTIVE',
                razorpayPaymentId: razorpay_payment_id,
                startDate: new Date()
            }
        })

        console.log('✅ Payment verified and subscription activated:', updatedSubscription)

        return NextResponse.json({
            success: true,
            message: 'Payment verified and subscription activated',
            subscription: updatedSubscription
        })

    } catch (error) {
        console.error('Payment verification error:', error)
        return NextResponse.json({
            error: 'Payment verification failed',
            details: error.message,
            success: false
        }, { status: 500 })
    }
}