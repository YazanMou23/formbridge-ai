
import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers } from '@/lib/auth';
import { sendRemarketingEmail } from '@/lib/email';

// Set a secret key for triggering this admin action
const ADMIN_SECRET = 'formbridge-admin-secret';

// To prevent Vercel timeouts on Serverless Functions (10s limit on Hobby), 
// we should ideally use a background job, but for MVP we will try to process quickly.
// If user base > 50, this might time out.

export const dynamic = 'force-dynamic'; // No caching

export async function GET(request: NextRequest) {
    try {
        // 1. Security Check
        const { searchParams } = new URL(request.url);
        const key = searchParams.get('key');

        if (key !== ADMIN_SECRET) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Get All Users
        console.log('[Admin] Fetching all users for email blast...');
        const users = await getAllUsers();

        if (!users || users.length === 0) {
            return NextResponse.json({ success: true, message: 'No users found', count: 0 });
        }

        console.log(`[Admin] Found ${users.length} users. Starting email sending...`);

        // 3. Send Emails (with slight delay to avoid rate limits if possible, but keeping it simple for now)
        // We use Promise.all to send in parallel, but limit concurrency if needed.
        // For now, simpler is better.

        let sentCount = 0;
        let errorCount = 0;

        const results = await Promise.allSettled(users.map(async (user) => {
            if (!user.email) return false;

            // Skip verify check for remarketing? Or only send to verified?
            // Sending to all registered users for now.

            return sendRemarketingEmail(user.email);
        }));

        results.forEach((result) => {
            if (result.status === 'fulfilled' && result.value === true) {
                sentCount++;
            } else {
                errorCount++;
            }
        });

        // 4. Return Report
        return NextResponse.json({
            success: true,
            message: 'Email blast completed',
            totalUsers: users.length,
            sent: sentCount,
            errors: errorCount
        });

    } catch (error: any) {
        console.error('[Admin] Email blast error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
