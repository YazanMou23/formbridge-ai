import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : true, // Default to true for port 465
    auth: {
        user: process.env.SMTP_USER || 'info@meinedienstleistungen.de',
        pass: process.env.SMTP_PASS || 'Seaways1Yazan2.',
    },
});

export async function sendVerificationEmail(email: string, token: string) {
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify?token=${token}`;

    const mailOptions = {
        from: process.env.SMTP_FROM || '"FormBridge AI" <info@meinedienstleistungen.de>',
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
        // Send real email using configured transport
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

export async function sendWelcomeEmail(email: string, name: string) {
    const mailOptions = {
        from: process.env.SMTP_FROM || '"FormBridge AI" <info@meinedienstleistungen.de>',
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
        // Send real email using configured transport
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending welcome email:', error);
        return false;
    }
}

export async function sendRemarketingEmail(email: string) {
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}`;

    // Using the previously defined content directly here for consistency
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #EF4444 0%, #F59E0B 100%); padding: 30px 20px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 0.5px; }
    .content { padding: 30px 25px; }
    .section { margin-bottom: 30px; padding-bottom: 30px; border-bottom: 1px solid #e5e7eb; }
    .section:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
    .btn-container { text-align: center; margin-top: 25px; }
    .btn { background-color: #EF4444; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: 700; display: inline-block; box-shadow: 0 4px 6px rgba(239, 68, 68, 0.3); transition: transform 0.2s; }
    .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 11px; line-height: 1.5; }
    h2 { color: #111827; font-size: 20px; margin-top: 0; font-weight: 700; }
    p { color: #4b5563; line-height: 1.6; font-size: 16px; margin: 10px 0; }
    .highlight { background-color: #FEF3C7; color: #92400E; padding: 2px 6px; border-radius: 4px; font-weight: 600; }
    .rtl { direction: rtl; text-align: right; }
    .unsubscribe { color: #9CA3AF; text-decoration: underline; margin-top: 10px; display: inline-block; }
</style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>Don't Let Paperwork Stop You 🛑</h1>
        </div>

        <div class="content">
            <!-- German Section -->
            <div class="section">
                <h2>🇩🇪 Ihre Dokumente warten...</h2>
                <p>
                    Lassen Sie sich nicht von deutscher Bürokratie aufhalten. Sie haben noch <span class="highlight">unbenutzte Credits</span> in Ihrem FormBridge AI-Konto!
                </p>
                <p><strong>Warum jetzt starten?</strong></p>
                <ul style="color: #4b5563; padding-left: 20px; margin-top: 5px;">
                    <li style="margin-bottom: 5px;">Übersetzen Sie komplexe Briefe in Sekunden.</li>
                    <li style="margin-bottom: 5px;">Füllen Sie Anträge fehlerfrei aus.</li>
                    <li style="margin-bottom: 5px;">Erstellen Sie den perfekten deutschen Lebenslauf.</li>
                </ul>
                <div class="btn-container">
                    <a href="${verificationLink}" class="btn">Meine Aufgaben erledigen &rarr;</a>
                </div>
            </div>

            <!-- Arabic Section -->
            <div class="section rtl">
                <h2>🇸🇾 هل ما زلت تعاني مع الأوراق؟</h2>
                <p>
                    لا تدع البيروقراطية الألمانية توقف تقدمك. لديك <span class="highlight">رصيد غير مستخدم</span> في حساب FormBridge AI الخاص بك!
                </p>
                <p><strong>لماذا تبدأ الآن؟</strong></p>
                <ul style="color: #4b5563; padding-right: 20px; margin-top: 5px;">
                    <li style="margin-bottom: 5px;">ترجم الرسائل المعقدة في ثوانٍ.</li>
                    <li style="margin-bottom: 5px;">املأ الطلبات الحكومية بدون أخطاء.</li>
                    <li style="margin-bottom: 5px;">أنشئ سيرة ذاتية ألمانية مثالية.</li>
                </ul>
                <div class="btn-container">
                    <a href="${verificationLink}" class="btn">إنجاز مهامي الآن ←</a>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>© ${new Date().getFullYear()} FormBridge AI. All rights reserved.</p>
            <p>FormBridge AI • Musterstraße 123 • 10115 Berlin • Germany</p>
            <a href="${verificationLink}/unsubscribe" class="unsubscribe">Unsubscribe / Abmelden / إلغاء الاشتراك</a>
        </div>
    </div>
</body>
</html>
    `;

    const mailOptions = {
        from: process.env.SMTP_FROM || '"FormBridge AI Team" <info@meinedienstleistungen.de>',
        to: email,
        subject: '🔔 Remember your unfinished tasks? / Erinnerung an Ihre Aufgaben',
        html: htmlContent,
    };

    try {
        // Send real email using configured transport
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending remarketing email:', error);
        return false;
    }
}
