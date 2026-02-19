
const nodemailer = require('nodemailer');

// Configuration
const config = {
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
        user: 'info@meinedienstleistungen.de',
        pass: 'Seaways1Yazan2.'
    }
};

const transporter = nodemailer.createTransport(config);

const recipient = 'yazanmousa03@gmail.com'; // Target user for testing

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
                    <a href="https://formbridge-ai.vercel.app" class="btn">Meine Aufgaben erledigen &rarr;</a>
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
                    <a href="https://formbridge-ai.vercel.app" class="btn">إنجاز مهامي الآن ←</a>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>© 2026 FormBridge AI. All rights reserved.</p>
            <p>FormBridge AI • Musterstraße 123 • 10115 Berlin • Germany</p>
            <a href="https://formbridge-ai.vercel.app/unsubscribe" class="unsubscribe">Unsubscribe / Abmelden / إلغاء الاشتراك</a>
        </div>
    </div>
</body>
</html>
`;

async function sendRemarketingEmail() {
    console.log(`Sending remarketing email to ${recipient}...`);
    try {
        const info = await transporter.sendMail({
            from: '"FormBridge AI Team" <info@meinedienstleistungen.de>',
            to: recipient,
            subject: '🔔 Remember your unfinished tasks? / Erinnerung an Ihre Aufgaben',
            html: htmlContent
        });
        console.log('✅ Remarketing email sent successfully!');
        console.log('Message ID:', info.messageId);
    } catch (error) {
        console.error('❌ Error sending email:', error);
    }
}

sendRemarketingEmail();
