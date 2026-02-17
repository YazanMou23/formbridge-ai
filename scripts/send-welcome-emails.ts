
import { sendWelcomeEmail } from '@/lib/email';
import fs from 'fs';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), '.data', 'users.json');

async function sendWelcomeToAll() {
    try {
        if (!fs.existsSync(USERS_FILE)) {
            console.log('No users file found.');
            return;
        }

        const data = fs.readFileSync(USERS_FILE, 'utf-8');
        const parsed = JSON.parse(data);
        const users = parsed.users || {};

        console.log(`Found ${Object.keys(users).length} users.`);

        for (const email of Object.keys(users)) {
            const user = users[email];
            console.log(`Sending welcome email to ${email} (${user.name})...`);
            await sendWelcomeEmail(email, user.name);
        }

        console.log('Done sending welcome emails.');

    } catch (error) {
        console.error('Error:', error);
    }
}

sendWelcomeToAll();
