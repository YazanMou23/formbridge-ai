import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserByEmail, getAllUsers } from '@/lib/auth';
import { welcomeEmail, retargetingEmail, newFeatureEmail, getWeeklyNewsletter } from '@/lib/emailTemplates';
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

// Reusable transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
        user: 'info@meinedienstleistungen.de',
        pass: 'Seaways1Yazan2.'
    }
});

async function sendToUsers(users: { email: string; name: string }[], subject: string, html: string) {
    let successCount = 0;
    let failCount = 0;

    for (const user of users) {
        try {
            await transporter.sendMail({
                from: '"FormBridge AI" <info@meinedienstleistungen.de>',
                to: user.email,
                subject,
                html
            });
            successCount++;
            console.log(`[Marketing] ✅ Sent to ${user.email}`);
        } catch (err) {
            console.error(`[Marketing] ❌ Failed ${user.email}:`, err);
            failCount++;
        }
    }
    return { successCount, failCount };
}

export async function POST(request: NextRequest) {
    try {
        const admin = await checkAdmin(request);
        if (!admin) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { type } = body;
        const users = await getAllUsers();
        if (users.length === 0) return NextResponse.json({ success: true, count: 0, message: 'No users found' });

        let subject = '';
        let html = '';

        switch (type) {
            case 'welcome': {
                // Send welcome to ALL users (admin broadcast)
                const results = { successCount: 0, failCount: 0 };
                for (const u of users) {
                    const email = welcomeEmail(u.name);
                    try {
                        await transporter.sendMail({
                            from: '"FormBridge AI" <info@meinedienstleistungen.de>',
                            to: u.email,
                            subject: email.subject,
                            html: email.html
                        });
                        results.successCount++;
                    } catch {
                        results.failCount++;
                    }
                }
                return NextResponse.json({ success: true, ...results, totalUsers: users.length });
            }

            case 'retargeting': {
                const results = { successCount: 0, failCount: 0 };
                for (const u of users) {
                    const email = retargetingEmail(u.name, u.credits);
                    try {
                        await transporter.sendMail({
                            from: '"FormBridge AI" <info@meinedienstleistungen.de>',
                            to: u.email,
                            subject: email.subject,
                            html: email.html
                        });
                        results.successCount++;
                    } catch {
                        results.failCount++;
                    }
                }
                return NextResponse.json({ success: true, ...results, totalUsers: users.length });
            }

            case 'new-feature': {
                const { featureName, featureEmoji, featureDescription, steps } = body;
                if (!featureName || !featureDescription || !steps) {
                    return NextResponse.json({ success: false, error: 'Missing feature details' }, { status: 400 });
                }
                const email = newFeatureEmail(featureName, featureEmoji || '🆕', featureDescription, steps);
                const results = await sendToUsers(users, email.subject, email.html);
                return NextResponse.json({ success: true, ...results, totalUsers: users.length });
            }

            case 'weekly-newsletter': {
                const weekNum = body.weekNumber;
                const newsletter = getWeeklyNewsletter(weekNum);
                const results = await sendToUsers(users, newsletter.subject, newsletter.html);
                return NextResponse.json({ success: true, ...results, totalUsers: users.length });
            }

            case 'custom': {
                // Legacy custom HTML blast
                subject = body.subject;
                html = body.htmlContent;
                if (!subject || !html) {
                    return NextResponse.json({ success: false, error: 'Subject and content required' }, { status: 400 });
                }
                const results = await sendToUsers(users, subject, html);
                return NextResponse.json({ success: true, ...results, totalUsers: users.length });
            }

            default:
                return NextResponse.json({ success: false, error: 'Unknown email type' }, { status: 400 });
        }
    } catch (error: any) {
        console.error('Marketing API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
