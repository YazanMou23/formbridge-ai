import { NextRequest, NextResponse } from 'next/server';
import { createPasswordResetToken } from '@/lib/auth';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ success: false, error: 'البريد الإلكتروني مطلوب' }, { status: 400 });
        }

        const token = await createPasswordResetToken(email);

        // We always return success even if email wasn't found to prevent email enumeration
        if (token) {
            // Fire and forget email
            sendPasswordResetEmail(email, token).catch(console.error);
        }

        return NextResponse.json({
            success: true,
            message: 'If the email exists, a password reset link has been sent.'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ success: false, error: 'حدث خطأ. يرجى المحاولة لاحقاً.' }, { status: 500 });
    }
}
