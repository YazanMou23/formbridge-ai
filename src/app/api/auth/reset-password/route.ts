import { NextRequest, NextResponse } from 'next/server';
import { resetPasswordAndClearToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const { token, password } = await request.json();

        if (!token || !password) {
            return NextResponse.json({ success: false, error: 'رمز إعادة التعيين وكلمة المرور مطلوبان' }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ success: false, error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }, { status: 400 });
        }

        const success = await resetPasswordAndClearToken(token, password);

        if (!success) {
            return NextResponse.json({ success: false, error: 'رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية.' }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            message: 'Password has been reset successfully.'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json({ success: false, error: 'حدث خطأ. يرجى المحاولة لاحقاً.' }, { status: 500 });
    }
}
