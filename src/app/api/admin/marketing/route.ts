import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserByEmail, getAllUsers } from '@/lib/auth';
import nodemailer from 'nodemailer';

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

// Mailer configuration (Reuse from send_newsletter_test.js)
const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
        user: 'info@meinedienstleistungen.de',
        pass: 'Seaways1Yazan2.' // User's provided SMTP password from script
    }
});

export async function POST(request: NextRequest) {
    try {
        const admin = await checkAdmin(request);
        if (!admin) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { subject, htmlContent } = await request.json();

        if (!subject || !htmlContent) {
            return NextResponse.json({ success: false, error: 'Subject and content required.' }, { status: 400 });
        }

        const users = await getAllUsers();
        if (users.length === 0) return NextResponse.json({ success: true, count: 0 });

        console.log(`[Admin Marketing] Starting blast to ${users.length} users...`);

        // Use Promise.all with batching if you have a lot of users
        // For now, let's do a simple loop (safest for lower SMTP limits)
        let successCount = 0;
        let failCount = 0;

        for (const user of users) {
            try {
                await transporter.sendMail({
                    from: '"FormBridge AI" <info@meinedienstleistungen.de>',
                    to: user.email,
                    subject: subject,
                    html: htmlContent
                });
                successCount++;
                console.log(`[Marketing] Sent to ${user.email}`); 
            } catch (err) {
                console.error(`[Marketing] Failed to send to ${user.email}:`, err);
                failCount++;
            }
        }

        return NextResponse.json({
            success: true,
            totalUsers: users.length,
            successCount,
            failCount
        });

    } catch (error: any) {
        console.error('Marketing API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
