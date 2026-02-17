import { NextRequest, NextResponse } from 'next/server';
import { verifyUserAccount, generateToken } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
        return NextResponse.redirect(new URL('/?error=missing_token', request.url));
    }

    const user = await verifyUserAccount(token);

    if (user) {
        // User verified successfully. Send welcome email.
        if (user.email && user.name) {
            await sendWelcomeEmail(user.email, user.name);
        }

        // Log them in automatically.
        const authToken = generateToken(user);
        const response = NextResponse.redirect(new URL('/?verified=true', request.url));
        response.cookies.set('auth_token', authToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });
        return response;
    } else {
        return NextResponse.redirect(new URL('/?error=invalid_token', request.url));
    }
}
