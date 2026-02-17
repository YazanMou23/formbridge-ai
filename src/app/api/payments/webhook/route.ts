import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { updateUserCredits, getUserByEmail } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const signature = request.headers.get('stripe-signature');

        if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
            return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
        }

        let event;
        try {
            event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
        } catch (err) {
            console.error('Webhook signature verification failed:', err);
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        // Handle successful payment
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const { userEmail, credits } = session.metadata || {};

            if (userEmail && credits) {
                const user = await getUserByEmail(userEmail);
                if (user) {
                    const newCredits = user.credits + parseInt(credits, 10);
                    await updateUserCredits(userEmail, newCredits);
                    console.log(`Added ${credits} credits to user ${userEmail}. New balance: ${newCredits}`);
                }
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
}

