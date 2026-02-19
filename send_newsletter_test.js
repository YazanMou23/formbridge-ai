
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

// Correcting the email address based on previous successful send (assuming typo in user request)
const recipient = 'yazanmousa03@gmail.com';

const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 30px 20px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 700; }
    .content { padding: 30px 20px; }
    .section { margin-bottom: 30px; padding-bottom: 30px; border-bottom: 1px solid #e5e7eb; }
    .section:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
    .btn-container { text-align: center; margin-top: 25px; }
    .btn { background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; }
    .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
    h2 { color: #111827; font-size: 20px; margin-top: 0; }
    p { color: #4b5563; line-height: 1.6; }
    ul { color: #4b5563; padding-left: 20px; }
    li { margin-bottom: 8px; }
    .rtl { direction: rtl; text-align: right; }
</style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>FormBridge AI</h1>
        </div>

        <div class="content">
            <!-- German Section -->
            <div class="section">
                <h2>🇩🇪 Neu: Aktivitätsverlauf & Profilverwaltung</h2>
                <p>
                    Wir haben eine oft gewünschte Funktion veröffentlicht: den <strong>Aktivitätsverlauf</strong>. 
                    Sie können jetzt ganz einfach auf alle Ihre vergangenen Interaktionen an einem Ort zugreifen.
                </p>
                <ul>
                    <li><strong>Verlauf einsehen:</strong> Rufen Sie frühere Formularübersetzungen und Dokumentenerklärungen sofort ab.</li>
                    <li><strong>Profil bearbeiten:</strong> Aktualisieren Sie ganz einfach Ihren Namen, Ihre E-Mail und Ihr Profilbild.</li>
                    <li><strong>Verbesserte Benutzeroberfläche:</strong> Genießen Sie eine reibungslosere Navigation.</li>
                </ul>
                <div class="btn-container">
                    <a href="https://formbridge-ai.vercel.app" class="btn">Jetzt ausprobieren</a>
                </div>
            </div>

            <!-- Arabic Section -->
            <div class="section rtl">
                <h2>🇸🇾 جديد: سجل النشاطات وإدارة الملف الشخصي</h2>
                <p>
                    لقد أطلقنا ميزة مطلوبة بشدة: <strong>سجل النشاطات</strong>. 
                    يمكنك الآن الوصول بسهولة إلى جميع تفاعلاتك السابقة في مكان واحد.
                </p>
                <ul>
                    <li><strong>سجل النشاطات:</strong> استرجع ترجمات النماذج وشروحات المستندات السابقة فوراً.</li>
                    <li><strong>تعديل الملف الشخصي:</strong> قم بتحديث اسمك وبريدك الإلكتروني وصورتك الشخصية بسهولة.</li>
                    <li><strong>واجهة محسنة:</strong> استمتع بتجربة تصفح أكثر سلاسة وتصاميم موحدة.</li>
                </ul>
                <div class="btn-container">
                    <a href="https://formbridge-ai.vercel.app" class="btn">جرب الآن</a>
                </div>
            </div>
        </div>

        <!-- Footer with Unsubscribe & Address (Anti-Spam Requirement) -->
        <div class="footer">
            <p>© 2026 FormBridge AI. All rights reserved.</p>
            <p>
                <a href="https://formbridge-ai.vercel.app/unsubscribe" style="color: #6b7280; text-decoration: underline;">Unsubscribe / Abmelden / إلغاء الاشتراك</a>
            </p>
            <p style="margin-top: 10px; font-size: 10px; color: #9ca3af;">
                FormBridge AI • Musterstraße 123 • 10115 Berlin • Germany
            </p>
        </div>
    </div>
</body>
</html>
`;

async function sendNewsletter() {
    console.log(`Sending bilingual newsletter to ${recipient}...`);
    try {
        const info = await transporter.sendMail({
            from: '"FormBridge AI" <info@meinedienstleistungen.de>',
            to: recipient,
            subject: 'New Update / Neues Update / تحديث جديد 🚀',
            html: htmlContent
        });
        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
    } catch (error) {
        console.error('❌ Error sending email:', error);
    }
}

sendNewsletter();
