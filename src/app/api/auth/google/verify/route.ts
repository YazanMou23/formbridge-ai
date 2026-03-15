import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail, generateToken } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        let userEmail: string;
        let userName: string;

        if (body.access_token) {
            // Implicit flow: verify the access token by calling Google's userinfo endpoint
            const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${body.access_token}` },
            });

            if (!googleRes.ok) {
                return NextResponse.json({ success: false, error: 'Invalid Google Token' }, { status: 401 });
            }

            const profile = await googleRes.json();
            if (!profile.email) {
                return NextResponse.json({ success: false, error: 'Could not get email from Google' }, { status: 401 });
            }

            userEmail = profile.email;
            userName = profile.name || profile.email.split('@')[0];

        } else if (body.credential) {
            // Legacy ID-token flow (kept for backward compatibility)
            const { OAuth2Client } = await import('google-auth-library');
            const client = new OAuth2Client();

            const ticket = await client.verifyIdToken({
                idToken: body.credential,
                audience: [
                    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
                    process.env.GooGlE_ClIENT_ID_ANDROID || ''
                ],
            });

            const payload = ticket.getPayload();
            if (!payload || !payload.email) {
                return NextResponse.json({ success: false, error: 'Invalid Google Token' }, { status: 401 });
            }

            userEmail = payload.email;
            userName = payload.name || payload.email.split('@')[0];

        } else {
            return NextResponse.json({ success: false, error: 'Missing token' }, { status: 400 });
        }

        // Find existing user or create new one
        let user = await getUserByEmail(userEmail);

        if (!user) {
            // Auto-register with a random password (Google users never use password login)
            const randomPassword = crypto.randomUUID() + crypto.randomUUID();
            user = await createUser(userName, userEmail, randomPassword);

            if (!user) {
                return NextResponse.json({ success: false, error: 'Error creating user account' }, { status: 500 });
            }

            // Mark as verified immediately
            await markUserVerified(userEmail);

            // Send welcome email (fire and forget)
            const { sendWelcomeEmail } = await import('@/lib/email');
            sendWelcomeEmail(userEmail, userName).catch(console.error);

        } else {
            // Auto-verify existing users who sign in with Google
            if ((user as any).isVerified === false || (user as any).isVerified === undefined) {
                await markUserVerified(userEmail);
            }
        }

        const token = generateToken(user);
        const response = NextResponse.json({ success: true, user, token });

        response.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });

        return response;
    } catch (error) {
        console.error('Google Auth Error:', error);
        return NextResponse.json({ success: false, error: 'حدث خطأ. يرجى المحاولة لاحقاً.' }, { status: 500 });
    }
}

async function markUserVerified(email: string) {
    if (process.env.KV_REST_API_URL || process.env.VERCEL) {
        const { kv } = await import('@vercel/kv');
        const storedUser = await kv.get(`user:${email}`);
        if (storedUser) {
            (storedUser as any).isVerified = true;
            await kv.set(`user:${email}`, storedUser);
        }
    } else {
        const fs = await import('fs');
        const path = await import('path');
        const USERS_FILE = path.join(process.cwd(), '.data', 'users.json');
        if (fs.existsSync(USERS_FILE)) {
            const data = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
            if (data.users && data.users[email]) {
                data.users[email].isVerified = true;
                fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
            }
        }
    }
}
