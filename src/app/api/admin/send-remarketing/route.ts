
import { NextResponse } from 'next/server';
import { getAllUsers } from '@/lib/auth';
import { sendRemarketingEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');

        // Simple protection to prevent accidental triggering
        if (secret !== process.env.ADMIN_SECRET && secret !== 'temp_admin_secret_123') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const users = await getAllUsers();
        console.log(`Found ${users.length} users to email.`);

        const results = {
            total: users.length,
            sent: 0,
            failed: 0,
            errors: [] as string[]
        };

        // Send emails in sequence to avoid overwhelming the SMTP server
        for (const user of users) {
            try {
                if (user.email) {
                    console.log(`Sending email to ${user.email}...`);
                    const success = await sendRemarketingEmail(user.email);
                    if (success) {
                        results.sent++;
                    } else {
                        results.failed++;
                        results.errors.push(`Failed to send to ${user.email}`);
                    }
                }
            } catch (error: any) {
                console.error(`Error processing user ${user.email}:`, error);
                results.failed++;
                results.errors.push(`Error for ${user.email}: ${error.message}`);
            }
        }

        return NextResponse.json({
            message: 'Remarketing campaign completed',
            results
        });

    } catch (error: any) {
        console.error('Error in remarketing API:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error.message },
            { status: 500 }
        );
    }
}
