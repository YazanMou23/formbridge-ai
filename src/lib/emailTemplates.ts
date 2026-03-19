// ═══════════════════════════════════════════════════════════════════════════
// FormBridge AI - Arabic Email Templates
// ═══════════════════════════════════════════════════════════════════════════

const BRAND_COLOR = '#6366f1';
const BRAND_GRADIENT = 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #6366f1 100%)';
const APP_URL = 'https://formbridge-ai.vercel.app';

function emailShell(content: string): string {
    return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
    @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
    body { font-family: 'Tajawal', 'Segoe UI', Tahoma, sans-serif; background-color: #0f172a; margin: 0; padding: 0; direction: rtl; color: #e2e8f0; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 20px; }
    .card { background: #1e293b; border-radius: 16px; overflow: hidden; border: 1px solid #334155; box-shadow: 0 20px 60px rgba(0,0,0,0.4); }
    .header { background: ${BRAND_GRADIENT}; padding: 40px 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -0.5px; }
    .header .subtitle { color: rgba(255,255,255,0.8); font-size: 14px; margin-top: 8px; }
    .body { padding: 35px 30px; }
    .body h2 { color: #f1f5f9; font-size: 22px; margin-top: 0; margin-bottom: 12px; font-weight: 700; }
    .body p { color: #94a3b8; line-height: 1.8; font-size: 15px; margin-bottom: 16px; }
    .body strong { color: #c7d2fe; }
    .cta-btn { display: inline-block; background: ${BRAND_GRADIENT}; color: white !important; padding: 14px 36px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 16px; margin-top: 10px; }
    .cta-center { text-align: center; margin: 28px 0; }
    .feature-box { background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 20px; margin: 16px 0; }
    .feature-box h3 { color: #a5b4fc; margin: 0 0 8px 0; font-size: 16px; }
    .feature-box p { color: #94a3b8; margin: 0; font-size: 14px; line-height: 1.7; }
    .step { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 18px; direction: rtl; }
    .step-num { background: ${BRAND_GRADIENT}; color: white; min-width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0; }
    .step-text { color: #cbd5e1; font-size: 14px; line-height: 1.7; padding-top: 4px; }
    .divider { border: none; border-top: 1px solid #334155; margin: 28px 0; }
    .footer { background: #0f172a; padding: 24px 30px; text-align: center; border-top: 1px solid #1e293b; }
    .footer p { color: #475569; font-size: 11px; margin: 4px 0; line-height: 1.6; }
    .footer a { color: #6366f1; text-decoration: underline; }
    .unsubscribe { margin-top: 16px; }
    .unsubscribe a { color: #64748b; font-size: 11px; }
    ul { padding-right: 20px; padding-left: 0; }
    li { color: #94a3b8; margin-bottom: 10px; line-height: 1.7; font-size: 14px; }
    li strong { color: #e2e8f0; }
</style>
</head>
<body>
<div class="wrapper">
    <div class="card">
        ${content}
    </div>
</div>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. Welcome Email - New User Registration
// ═══════════════════════════════════════════════════════════════════════════
export function welcomeEmail(userName: string): { subject: string; html: string } {
    const subject = '🎉 أهلاً بك في FormBridge AI - حسابك جاهز!';
    const html = emailShell(`
        <div class="header">
            <h1>🎉 أهلاً بك في FormBridge AI</h1>
            <div class="subtitle">مساعدك الذكي لتعبئة النماذج الألمانية</div>
        </div>
        <div class="body">
            <h2>مرحباً ${userName}! 👋</h2>
            <p>
                يسعدنا انضمامك إلينا! حسابك جاهز الآن ولديك <strong>10 نقاط مجانية</strong> لتبدأ باستخدام جميع أدواتنا.
            </p>

            <hr class="divider" />

            <h2>🛠️ ماذا يمكنك أن تفعل؟</h2>

            <div class="feature-box">
                <h3>📝 تعبئة النماذج الألمانية</h3>
                <p>ارفع صورة لأي نموذج ألماني (عقد عمل، طلب إقامة، تأمين...) وسيقوم الذكاء الاصطناعي بتعبئته لك تلقائياً بمعلوماتك الشخصية.</p>
            </div>

            <div class="feature-box">
                <h3>💡 شرح المستندات</h3>
                <p>لا تفهم رسالة من البنك أو الجوب سنتر؟ ارفع صورة المستند وسنشرحه لك باللهجة السورية بطريقة بسيطة ومفهومة.</p>
            </div>

            <div class="feature-box">
                <h3>👔 إنشاء سيرة ذاتية احترافية</h3>
                <p>أنشئ سيرة ذاتية بتصميم عصري أو متوافق مع أنظمة ATS. فقط أدخل معلوماتك وسنجهز لك CV جاهز للتحميل.</p>
            </div>

            <div class="feature-box">
                <h3>✍️ تعديل وتوقيع PDF</h3>
                <p>أضف نصوصاً وتوقيعك الشخصي على أي ملف PDF. مثالي لتوقيع العقود والوثائق الرسمية.</p>
            </div>

            <hr class="divider" />

            <h2>🚀 كيف تبدأ؟</h2>

            <div class="step">
                <div class="step-num">1</div>
                <div class="step-text">سجّل الدخول على الموقع أو التطبيق</div>
            </div>
            <div class="step">
                <div class="step-num">2</div>
                <div class="step-text">اختر الخدمة التي تحتاجها من القائمة الرئيسية</div>
            </div>
            <div class="step">
                <div class="step-num">3</div>
                <div class="step-text">ارفع صورة المستند أو النموذج واترك الباقي علينا!</div>
            </div>

            <div class="cta-center">
                <a href="${APP_URL}" class="cta-btn">ابدأ الآن مجاناً ←</a>
            </div>

            <p style="text-align:center; color:#64748b; font-size:13px;">
                لديك 10 نقاط مجانية • كل استخدام = 1 نقطة • كتابة السيرة الذاتية = 3 نقاط
            </p>
        </div>
        <div class="footer">
            <p>© 2026 FormBridge AI. جميع الحقوق محفوظة.</p>
            <p>FormBridge AI • Berlin, Germany</p>
            <div class="unsubscribe">
                <a href="${APP_URL}/unsubscribe">إلغاء الاشتراك من النشرة البريدية</a>
            </div>
        </div>
    `);
    return { subject, html };
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. Retargeting Email - Bring Back Inactive Users
// ═══════════════════════════════════════════════════════════════════════════
export function retargetingEmail(userName: string, credits: number): { subject: string; html: string } {
    const subject = '🔔 اشتقنالك! نقاطك لا تزال في انتظارك';
    const html = emailShell(`
        <div class="header">
            <h1>🔔 وين رحت؟ اشتقنالك!</h1>
            <div class="subtitle">نقاطك ما بتنتظر للأبد...</div>
        </div>
        <div class="body">
            <h2>أهلاً ${userName}! 👋</h2>
            <p>
                لاحظنا إنك ما استخدمت <strong>FormBridge AI</strong> من فترة. لا تنسى إن عندك 
                <strong>${credits} نقطة</strong> جاهزة للاستخدام!
            </p>

            <hr class="divider" />

            <h2>💡 هل تعلم؟</h2>
            <ul>
                <li><strong>أكثر من 500 مستخدم</strong> يعتمدون على FormBridge AI يومياً لتعبئة نماذجهم</li>
                <li><strong>توفير أكثر من 30 دقيقة</strong> في كل نموذج بفضل الذكاء الاصطناعي</li>
                <li><strong>دقة تعبئة 95%+</strong> في النماذج الحكومية الألمانية</li>
            </ul>

            <hr class="divider" />

            <h2>🎁 عرض خاص لعودتك!</h2>
            <p>
                ارجع استخدم حسابك اليوم واستفد من نقاطك المجانية قبل ما تنتهي. 
                كل ما تحتاجه هو صورة للنموذج وخلّي الباقي علينا!
            </p>

            <div class="feature-box">
                <h3>🆕 ميزات جديدة أضفناها مؤخراً:</h3>
                <p>• إنشاء سيرة ذاتية احترافية بالذكاء الاصطناعي<br/>
                   • تعديل وتوقيع ملفات PDF مباشرة<br/>
                   • تحويل الصور إلى PDF بجودة عالية<br/>
                   • سجل نشاطات كامل لجميع عملياتك</p>
            </div>

            <div class="cta-center">
                <a href="${APP_URL}" class="cta-btn">ارجع واستخدم نقاطك ←</a>
            </div>

            <p style="text-align:center; color:#64748b; font-size:13px;">
                عندك ${credits} نقطة متاحة • لا تخليها تضيع!
            </p>
        </div>
        <div class="footer">
            <p>© 2026 FormBridge AI. جميع الحقوق محفوظة.</p>
            <p>FormBridge AI • Berlin, Germany</p>
            <div class="unsubscribe">
                <a href="${APP_URL}/unsubscribe">إلغاء الاشتراك من النشرة البريدية</a>
            </div>
        </div>
    `);
    return { subject, html };
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. New Feature Newsletter - With Guide
// ═══════════════════════════════════════════════════════════════════════════
export function newFeatureEmail(
    featureName: string,
    featureEmoji: string,
    featureDescription: string,
    steps: string[]
): { subject: string; html: string } {
    const subject = `🆕 ميزة جديدة: ${featureName} - تعلّم كيف تستخدمها!`;

    const stepsHtml = steps.map((step, i) => `
        <div class="step">
            <div class="step-num">${i + 1}</div>
            <div class="step-text">${step}</div>
        </div>
    `).join('');

    const html = emailShell(`
        <div class="header">
            <h1>${featureEmoji} ميزة جديدة في FormBridge AI</h1>
            <div class="subtitle">اكتشف ${featureName} الآن!</div>
        </div>
        <div class="body">
            <h2>🎊 أضفنا ميزة جديدة: ${featureName}</h2>
            <p>${featureDescription}</p>

            <hr class="divider" />

            <h2>📖 دليل الاستخدام خطوة بخطوة:</h2>
            ${stepsHtml}

            <hr class="divider" />

            <div class="feature-box">
                <h3>💰 كم تكلف هذه الميزة؟</h3>
                <p>كل استخدام يكلف <strong>نقطة واحدة فقط</strong> (ما عدا كتابة السيرة الذاتية = 3 نقاط). إذا نقاطك خلصت، تقدر تشتري نقاط إضافية من داخل التطبيق.</p>
            </div>

            <div class="cta-center">
                <a href="${APP_URL}" class="cta-btn">جرّب الميزة الجديدة الآن ←</a>
            </div>

            <p style="text-align:center; color:#64748b; font-size:13px;">
                شاركنا رأيك! نحب نسمع تجربتك مع الميزات الجديدة 💬
            </p>
        </div>
        <div class="footer">
            <p>© 2026 FormBridge AI. جميع الحقوق محفوظة.</p>
            <p>FormBridge AI • Berlin, Germany</p>
            <div class="unsubscribe">
                <a href="${APP_URL}/unsubscribe">إلغاء الاشتراك من النشرة البريدية</a>
            </div>
        </div>
    `);
    return { subject, html };
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. Weekly Newsletter Topics Pool (rotated each week)
// ═══════════════════════════════════════════════════════════════════════════
const weeklyTopics = [
    {
        subject: '📋 نصيحة الأسبوع: كيف تعبئ عقد العمل الألماني بشكل صحيح',
        title: '📋 نصيحة الأسبوع',
        content: `
            <h2>كيف تعبئ عقد العمل الألماني بشكل صحيح؟</h2>
            <p>عقد العمل (Arbeitsvertrag) من أهم المستندات اللي رح تواجهك في ألمانيا. خلينا نشرحلك أهم النقاط:</p>
            <div class="feature-box">
                <h3>📌 النقاط الأساسية في عقد العمل:</h3>
                <p>
                    • <strong>Arbeitgeber:</strong> اسم صاحب العمل أو الشركة<br/>
                    • <strong>Arbeitnehmer:</strong> اسمك الكامل كما في جواز السفر<br/>
                    • <strong>Beginn:</strong> تاريخ بداية العمل<br/>
                    • <strong>Probezeit:</strong> فترة التجربة (عادة 6 أشهر)<br/>
                    • <strong>Gehalt:</strong> الراتب الشهري قبل الضرائب (Brutto)
                </p>
            </div>
            <p>مع FormBridge AI، بس ارفع صورة العقد وخلّي الذكاء الاصطناعي يعبّيه لك بدقة عالية! 🎯</p>
        `
    },
    {
        subject: '🏠 نصيحة الأسبوع: فهم رسائل البنك والتأمين الألمانية',
        title: '🏠 نصيحة الأسبوع',
        content: `
            <h2>كيف تفهم رسائل البنك والتأمين؟</h2>
            <p>وصلتك رسالة من البنك أو شركة التأمين وما فهمت شي؟ هالشي طبيعي! خلينا نساعدك:</p>
            <div class="feature-box">
                <h3>🏦 أشهر أنواع الرسائل البنكية:</h3>
                <p>
                    • <strong>Kontoauszug:</strong> كشف حساب بنكي<br/>
                    • <strong>Mahnung:</strong> تذكير بدفعة مستحقة (مهم جداً!)<br/>
                    • <strong>Kündigung:</strong> إلغاء خدمة أو عقد<br/>
                    • <strong>Lastschrift:</strong> خصم تلقائي من حسابك
                </p>
            </div>
            <p>استخدم ميزة <strong>"شرح المستندات"</strong> في FormBridge AI وارفع صورة الرسالة. رح نشرحها لك باللهجة السورية بطريقة سهلة ومفهومة! 💡</p>
        `
    },
    {
        subject: '👔 نصيحة الأسبوع: أسرار السيرة الذاتية الناجحة في ألمانيا',
        title: '👔 نصيحة الأسبوع',
        content: `
            <h2>أسرار السيرة الذاتية الناجحة في سوق العمل الألماني</h2>
            <p>السيرة الذاتية هي أول انطباع عنك عند صاحب العمل. إليك أهم النصائح:</p>
            <div class="feature-box">
                <h3>✅ نصائح ذهبية:</h3>
                <p>
                    • استخدم صيغة <strong>ATS-friendly</strong> حتى يقرأها النظام الآلي<br/>
                    • اكتب <strong>Berufserfahrung</strong> (الخبرات) من الأحدث للأقدم<br/>
                    • أضف <strong>Sprachkenntnisse</strong> (المهارات اللغوية) بوضوح<br/>
                    • لا تنسى <strong>صورة شخصية احترافية</strong> (مهم جداً في ألمانيا!)
                </p>
            </div>
            <p>مع ميزة <strong>"إنشاء سيرة ذاتية"</strong> في FormBridge AI، تقدر تنشئ CV احترافي بدقائق! فقط أدخل معلوماتك وخلّي الذكاء الاصطناعي يصمم لك سيرة ذاتية مذهلة. 🚀</p>
        `
    },
    {
        subject: '📄 نصيحة الأسبوع: كيف توقّع المستندات إلكترونياً',
        title: '📄 نصيحة الأسبوع',
        content: `
            <h2>كيف توقّع المستندات إلكترونياً بسهولة؟</h2>
            <p>في ألمانيا، كثير من المستندات تحتاج توقيعك الشخصي. بدل ما تطبع وتسكن وترجع تصوّر، استخدم التوقيع الإلكتروني!</p>
            <div class="feature-box">
                <h3>✍️ خطوات التوقيع الإلكتروني:</h3>
                <p>
                    • ارفع ملف PDF على FormBridge AI<br/>
                    • اضغط على المكان اللي بدك توقّع فيه<br/>
                    • ارسم توقيعك بإصبعك أو بالماوس<br/>
                    • حمّل الملف الموقّع جاهز للإرسال!
                </p>
            </div>
            <p>ميزة <strong>"تعديل وتوقيع PDF"</strong> توفر عليك وقت ومشوار. جرّبها اليوم! ✨</p>
        `
    },
    {
        subject: '🎯 نصيحة الأسبوع: أهم 5 نماذج حكومية لازم تعرفها',
        title: '🎯 نصيحة الأسبوع',
        content: `
            <h2>أهم 5 نماذج حكومية لازم تعرفها في ألمانيا</h2>
            <p>كمقيم في ألمانيا، رح تحتاج تتعامل مع هالنماذج بشكل متكرر:</p>
            <div class="feature-box">
                <h3>📋 النماذج الأساسية:</h3>
                <p>
                    <strong>1. Anmeldung</strong> - تسجيل عنوان السكن (أول شي لازم تعمله!)<br/><br/>
                    <strong>2. Aufenthaltserlaubnis</strong> - طلب تصريح الإقامة<br/><br/>
                    <strong>3. Kindergeld</strong> - طلب مخصصات الأطفال<br/><br/>
                    <strong>4. Wohngeld</strong> - طلب دعم السكن<br/><br/>
                    <strong>5. Steuererklärung</strong> - الإقرار الضريبي السنوي
                </p>
            </div>
            <p>كل هالنماذج تقدر تعبّيها بثوانٍ مع FormBridge AI! بس صوّر النموذج وخلّي الذكاء الاصطناعي يشتغل. 🤖</p>
        `
    },
    {
        subject: '💼 نصيحة الأسبوع: كيف تحوّل صور مستنداتك لملفات PDF',
        title: '💼 نصيحة الأسبوع',
        content: `
            <h2>حوّل صور مستنداتك لملفات PDF احترافية</h2>
            <p>كثير مواقع وجهات حكومية بتطلب منك ترسل مستنداتك بصيغة PDF. إليك الطريقة الأسهل:</p>
            <div class="feature-box">
                <h3>🖼️ ميزة تحويل الصور إلى PDF:</h3>
                <p>
                    • ارفع أي صورة (JPG أو PNG) من جوالك أو كمبيوترك<br/>
                    • قص الصورة واختر الجزء المطلوب فقط<br/>
                    • تقدر تدوّر الصورة يمين أو يسار<br/>
                    • اضغط "إنشاء PDF" وحمّل الملف جاهز!
                </p>
            </div>
            <p>لا تضيع وقتك بتطبيقات معقدة. FormBridge AI يخلّص الشغل بضغطة زر! 📱</p>
        `
    }
];

export function getWeeklyNewsletter(weekNumber?: number): { subject: string; html: string } {
    const week = weekNumber !== undefined ? weekNumber : Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    const topic = weeklyTopics[week % weeklyTopics.length];

    const html = emailShell(`
        <div class="header">
            <h1>${topic.title}</h1>
            <div class="subtitle">النشرة الأسبوعية من FormBridge AI</div>
        </div>
        <div class="body">
            ${topic.content}

            <hr class="divider" />

            <div class="cta-center">
                <a href="${APP_URL}" class="cta-btn">جرّب الآن على FormBridge AI ←</a>
            </div>

            <p style="text-align:center; color:#64748b; font-size:13px;">
                نرسل لك نصيحة جديدة كل أسبوع • تابعنا للمزيد! 📬
            </p>
        </div>
        <div class="footer">
            <p>© 2026 FormBridge AI. جميع الحقوق محفوظة.</p>
            <p>FormBridge AI • Berlin, Germany</p>
            <div class="unsubscribe">
                <a href="${APP_URL}/unsubscribe">إلغاء الاشتراك من النشرة البريدية</a>
            </div>
        </div>
    `);

    return { subject: topic.subject, html };
}

// Export topic count for the admin UI
export const WEEKLY_TOPICS_COUNT = weeklyTopics.length;
