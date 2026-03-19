import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserByEmail, getAllUsers, updateUserCredits, updateUserProfile } from '@/lib/auth';

// Helper to check for admin authorization
async function checkAdmin(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded) return null;

    const user = await getUserByEmail(decoded.email);
    if (!user || user.role !== 'admin') return null;

    return user;
}

// GET lists all users
export async function GET(request: NextRequest) {
    try {
        const admin = await checkAdmin(request);
        if (!admin) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const users = await getAllUsers();
        return NextResponse.json({ success: true, users });
    } catch (error) {
        console.error('Admin Fetch Users Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 });
    }
}

// POST updates/deducts credits for a user
export async function POST(request: NextRequest) {
    try {
        const admin = await checkAdmin(request);
        if (!admin) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { email, credits, updates } = await request.json();

        if (credits !== undefined) {
             const success = await updateUserCredits(email, credits);
             if (!success) return NextResponse.json({ success: false, error: 'User not found or credit update failed' });
        }

        if (updates) {
            const res = await updateUserProfile(email, updates);
            if (!res.success) return NextResponse.json({ success: false, error: res.error });
        }

        const updatedUser = await getUserByEmail(email);
        return NextResponse.json({ success: true, user: updatedUser });

    } catch (error) {
        console.error('Admin Update User Error:', error);
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
}
