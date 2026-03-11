import { NextRequest, NextResponse } from 'next/server';
import { validateUser, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ success: false, error: 'البريد وكلمة المرور مطلوبان' }, { status: 400 });
        }

        let user;
        try {
            user = await validateUser(email, password);
        } catch (e: any) {
            if (e.message === 'NOT_VERIFIED') {
                return NextResponse.json({ success: false, error: 'الرجاء تفعيل حسابك من خلال الرابط المرسل إلى بريدك الإلكتروني' }, { status: 403 });
            }
            throw e;
        }

        if (!user) {
            return NextResponse.json({ success: false, error: 'بيانات تسجيل الدخول غير صحيحة' }, { status: 401 });
        }

        const token = generateToken(user);

        const response = NextResponse.json({ success: true, user, token });
        // Session cookie - no maxAge means it expires when browser closes
        response.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            // No maxAge = session cookie (deleted when browser closes)
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ success: false, error: 'فشل تسجيل الدخول' }, { status: 500 });
    }
}
