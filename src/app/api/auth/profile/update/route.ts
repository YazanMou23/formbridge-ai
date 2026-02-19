
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, updateUserProfile, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded || !decoded.email) {
            return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
        }

        const body = await request.json();
        const { name, email, photoUrl } = body;

        // Validation
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ success: false, error: 'Invalid email format' }, { status: 400 });
        }

        // Update Profile
        const result = await updateUserProfile(decoded.email, { name, email, photoUrl });

        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error || 'Update failed' }, { status: 400 });
        }

        // If email changed, issue new token
        let newToken = undefined;
        if (email && email !== decoded.email && result.user) {
            newToken = generateToken(result.user);
        }

        const response = NextResponse.json({
            success: true,
            user: result.user
        });

        // Set cookie if token changed
        if (newToken) {
            response.cookies.set('auth_token', newToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 7 // 7 days
            });
        }

        return response;

    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
