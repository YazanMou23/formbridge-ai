import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers } from '@/lib/auth';
import { getWeeklyNewsletter } from '@/lib/emailTemplates';
import nodemailer from 'nodemailer';

// This endpoint can be triggered by Vercel Cron Jobs
// Add to vercel.json: { "crons": [{ "path": "/api/cron/weekly-newsletter", "schedule": "0 9 * * 1" }] }
// Sends every Monday at 9:00 AM UTC

const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
        user: 'info@meinedienstleistungen.de',
        pass: 'Seaways1Yazan2.'
    }
});

export async function GET(request: NextRequest) {
    try {
        // Verify cron secret (Vercel sets this automatically)
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        // Allow if running from Vercel Cron or if no secret is set (dev mode)
        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const users = await getAllUsers();
        if (users.length === 0) {
            return NextResponse.json({ success: true, message: 'No users to send to' });
        }

        // Generate unique newsletter based on current week
        const newsletter = getWeeklyNewsletter();

        let successCount = 0;
        let failCount = 0;

        for (const user of users) {
            try {
                await transporter.sendMail({
                    from: '"FormBridge AI" <info@meinedienstleistungen.de>',
                    to: user.email,
                    subject: newsletter.subject,
                    html: newsletter.html
                });
                successCount++;
            } catch (err) {
                console.error(`[Weekly Cron] Failed to send to ${user.email}:`, err);
                failCount++;
            }
        }

        console.log(`[Weekly Newsletter] Sent: ${successCount}, Failed: ${failCount}`);

        return NextResponse.json({
            success: true,
            totalUsers: users.length,
            successCount,
            failCount,
            topic: newsletter.subject
        });
    } catch (error: any) {
        console.error('Weekly Newsletter Cron Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
