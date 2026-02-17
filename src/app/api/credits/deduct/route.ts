import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, deductUserCredits, getUserByEmail } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 });
        }

        const { amount } = await request.json();

        if (!amount || amount < 1) {
            return NextResponse.json({ success: false, error: 'قيمة غير صالحة' }, { status: 400 });
        }

        const result = await deductUserCredits(decoded.email, amount);

        if (!result.success) {
            return NextResponse.json({
                success: false,
                error: 'رصيد غير كافٍ',
                credits: result.newCredits
            }, { status: 400 });
        }

        // Get updated user data
        const user = await getUserByEmail(decoded.email);

        return NextResponse.json({
            success: true,
            credits: result.newCredits,
            user
        });
    } catch (error) {
        console.error('Deduct credits error:', error);
        return NextResponse.json({ success: false, error: 'فشل في خصم الرصيد' }, { status: 500 });
    }
}
