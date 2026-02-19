
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserByEmail } from '@/lib/auth';
import { getUserHistory } from '@/lib/history';

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded || !decoded.email) {
            return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
        }

        const history = await getUserHistory(decoded.email, 50); // Get last 50 items

        return NextResponse.json({ success: true, history });
    } catch (error) {
        console.error('Error fetching history:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch history' }, { status: 500 });
    }
}
