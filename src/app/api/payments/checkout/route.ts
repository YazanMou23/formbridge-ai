import { NextRequest, NextResponse } from 'next/server';
import { stripe, getPackageById } from '@/lib/stripe';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        // Verify user is authenticated
        const token = request.cookies.get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ success: false, error: 'يجب تسجيل الدخول أولاً' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ success: false, error: 'جلسة غير صالحة' }, { status: 401 });
        }

        const { packageId } = await request.json();
        const creditPackage = getPackageById(packageId);

        if (!creditPackage) {
            return NextResponse.json({ success: false, error: 'باقة غير صالحة' }, { status: 400 });
        }

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: creditPackage.currency,
                        product_data: {
                            name: `FormBridge AI - ${creditPackage.name}`,
                            description: `${creditPackage.credits} credits for form processing`,
                        },
                        unit_amount: creditPackage.price,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?payment=success&credits=${creditPackage.credits}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?payment=cancelled`,
            metadata: {
                userId: decoded.id,
                userEmail: decoded.email,
                packageId: creditPackage.id,
                credits: String(creditPackage.credits),
            },
        });

        return NextResponse.json({ success: true, url: session.url });
    } catch (error) {
        console.error('Checkout error:', error);
        return NextResponse.json({ success: false, error: 'فشل في إنشاء جلسة الدفع' }, { status: 500 });
    }
}
