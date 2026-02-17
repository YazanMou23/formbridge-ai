import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendVerificationEmail(email: string, token: string) {
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify?token=${token}`;

    const mailOptions = {
        from: process.env.SMTP_FROM || '"FormBridge AI" <noreply@formbridge.ai>',
        to: email,
        subject: 'Verify your email address - FormBridge AI',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                <h2 style="color: #4F46E5;">Welcome to FormBridge AI!</h2>
                <p>Please click the button below to verify your email address and activate your account.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Verify Email</a>
                </div>
                <p>If you didn't create an account, you can safely ignore this email.</p>
                <p style="font-size: 12px; color: #666; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
                    If the button doesn't work, copy and paste this link into your browser:<br> <a href="${verificationLink}" style="color: #4F46E5;">${verificationLink}</a>
                </p>
            </div>
        `,
    };

    try {
        if (!process.env.SMTP_USER) {
            console.log('---------------------------------------------------');
            console.log('📧 MOCK EMAIL SEND (Configure SMTP to send real emails)');
            console.log(`To: ${email}`);
            console.log(`Subject: ${mailOptions.subject}`);
            console.log(`Link: ${verificationLink}`);
            console.log('---------------------------------------------------');
            return true;
        }
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

export async function sendWelcomeEmail(email: string, name: string) {
    const mailOptions = {
        from: process.env.SMTP_FROM || '"FormBridge AI" <noreply@formbridge.ai>',
        to: email,
        subject: 'Welcome to FormBridge AI! 🎉',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                <h2 style="color: #4F46E5;">Welcome, ${name}!</h2>
                <p>We're thrilled to have you on board. Your account has been successfully verified.</p>
                <p>With FormBridge AI, you can now:</p>
                <ul style="color: #444;">
                    <li>📝 Fill out complex forms with ease</li>
                    <li>💡 Get explanations for difficult documents</li>
                    <li>👔 Build professional CVs</li>
                    <li>✍️ Edit and sign PDF documents</li>
                </ul>
                <p>You have free credits to get started. Log in now and try out our features!</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
                </div>
                <p style="font-size: 12px; color: #666; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
                    © ${new Date().getFullYear()} FormBridge AI. All rights reserved.
                </p>
            </div>
        `,
    };

    try {
        if (!process.env.SMTP_USER) {
            console.log('---------------------------------------------------');
            console.log('📧 MOCK EMAIL SEND (Welcome Email)');
            console.log(`To: ${email}`);
            console.log(`Subject: ${mailOptions.subject}`);
            console.log('---------------------------------------------------');
            return true;
        }
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending welcome email:', error);
        return false;
    }
}
