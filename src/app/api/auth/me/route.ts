import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserByEmail } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ success: false, user: null });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ success: false, user: null });
        }

        const user = await getUserByEmail(decoded.email);
        if (!user) {
            return NextResponse.json({ success: false, user: null });
        }

        return NextResponse.json({ success: true, user });
    } catch {
        return NextResponse.json({ success: false, user: null });
    }
}
