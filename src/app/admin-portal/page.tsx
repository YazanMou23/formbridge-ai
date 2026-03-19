'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { apiFetch } from '@/lib/apiHelper';
import Header from '@/components/Header';
import type { User } from '@/types/auth';

type Tab = 'users' | 'marketing';

interface FeatureForm {
    featureName: string;
    featureEmoji: string;
    featureDescription: string;
    steps: string[];
}

export default function AdminPortal() {
    const { locale, setLocale, credits } = useApp();
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('users');
    const [searchQuery, setSearchQuery] = useState('');

    // Marketing
    const [isSending, setIsSending] = useState(false);
    const [sendingType, setSendingType] = useState<string>('');

    // New Feature Form
    const [showFeatureForm, setShowFeatureForm] = useState(false);
    const [featureForm, setFeatureForm] = useState<FeatureForm>({
        featureName: '',
        featureEmoji: '🆕',
        featureDescription: '',
        steps: ['', '', '']
    });

    // Custom Email
    const [showCustomForm, setShowCustomForm] = useState(false);
    const [customSubject, setCustomSubject] = useState('');
    const [customHtml, setCustomHtml] = useState('');

    useEffect(() => {
        async function checkSession() {
            try {
                const res = await apiFetch('/api/auth/me');
                const data = await res.json();
                if (data.success && data.user && data.user.role === 'admin') {
                    setUser(data.user);
                    fetchUsers();
                } else {
                    window.location.href = '/';
                }
            } catch {
                window.location.href = '/';
            } finally {
                setAuthLoading(false);
            }
        }
        checkSession();
    }, []);

    const fetchUsers = async () => {
        setIsLoadingUsers(true);
        setError(null);
        try {
            const res = await apiFetch('/api/admin/users');
            const data = await res.json();
            if (data.success) setUsers(data.users);
            else setError(data.error || 'Failed to fetch users');
        } catch {
            setError('Fetch failed');
        } finally {
            setIsLoadingUsers(false);
        }
    };

    const handleUpdateUser = async (email: string, amount: number, updates?: any) => {
        setError(null);
        setSuccessMsg(null);
        try {
            const res = await apiFetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, credits: amount, updates }),
            });
            const data = await res.json();
            if (data.success) {
                showNotification(`✅ تم تحديث ${email} بنجاح`);
                fetchUsers();
            } else {
                setError(data.error || 'Update failed');
            }
        } catch {
            setError('Update failed');
        }
    };

    const showNotification = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(null), 4000);
    };

    const sendCampaign = async (type: string, extraData?: any) => {
        if (!confirm(`هل أنت متأكد من إرسال هذا البريد إلى ${users.length} مستخدم؟`)) return;

        setIsSending(true);
        setSendingType(type);
        setError(null);
        setSuccessMsg(null);

        try {
            const res = await apiFetch('/api/admin/marketing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, ...extraData }),
            });
            const data = await res.json();
            if (data.success) {
                showNotification(`✅ تم الإرسال! نجاح: ${data.successCount} | فشل: ${data.failCount}`);
                setShowFeatureForm(false);
                setShowCustomForm(false);
            } else {
                setError(data.error || 'فشل الحملة');
            }
        } catch {
            setError('حدث خطأ أثناء الإرسال');
        } finally {
            setIsSending(false);
            setSendingType('');
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (authLoading) return (
        <div style={styles.loadingScreen}>
            <div className="loading-spinner" />
            <p style={{ color: '#94a3b8', marginTop: 16 }}>جارٍ التحقق من الصلاحيات...</p>
        </div>
    );

    return (
        <div style={styles.pageWrapper}>
            <Header
                locale={locale}
                onLocaleChange={setLocale}
                credits={user?.credits || 0}
                user={user}
                onLoginClick={() => {}}
                onLogout={() => window.location.href = '/'}
                onBuyCredits={() => {}}
                onEditProfile={() => {}}
            />

            <main style={styles.main}>
                {/* Hero */}
                <div style={styles.hero}>
                    <div style={styles.heroGlow} />
                    <h1 style={styles.heroTitle}>
                        <span style={styles.heroIcon}>⚙️</span>
                        لوحة تحكم المدير
                    </h1>
                    <p style={styles.heroSub}>
                        إدارة العملاء • الرصيد • حملات البريد الإلكتروني
                    </p>
                    <div style={styles.statsRow}>
                        <div style={styles.statCard}>
                            <span style={styles.statNum}>{users.length}</span>
                            <span style={styles.statLabel}>إجمالي العملاء</span>
                        </div>
                        <div style={styles.statCard}>
                            <span style={styles.statNum}>{users.reduce((sum, u) => sum + u.credits, 0)}</span>
                            <span style={styles.statLabel}>إجمالي النقاط</span>
                        </div>
                        <div style={styles.statCard}>
                            <span style={styles.statNum}>{users.filter(u => u.role === 'admin').length}</span>
                            <span style={styles.statLabel}>المدراء</span>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                {error && <div style={styles.alertError}><span>❌</span> {error}</div>}
                {successMsg && <div style={styles.alertSuccess}><span>✅</span> {successMsg}</div>}

                {/* Tabs */}
                <div style={styles.tabsContainer}>
                    <button
                        style={activeTab === 'users' ? { ...styles.tab, ...styles.tabActive } : styles.tab}
                        onClick={() => setActiveTab('users')}
                    >
                        <span>👥</span> إدارة العملاء
                    </button>
                    <button
                        style={activeTab === 'marketing' ? { ...styles.tab, ...styles.tabActive } : styles.tab}
                        onClick={() => setActiveTab('marketing')}
                    >
                        <span>📧</span> حملات البريد
                    </button>
                </div>

                {/* ═══════ TAB: Users ═══════ */}
                {activeTab === 'users' && (
                    <div style={styles.section}>
                        <div style={styles.sectionHeader}>
                            <h2 style={styles.sectionTitle}>👥 إدارة العملاء ({users.length})</h2>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input
                                    type="text"
                                    placeholder="🔍 بحث عن عميل..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    style={styles.searchInput}
                                />
                                <button style={styles.refreshBtn} onClick={fetchUsers} disabled={isLoadingUsers}>
                                    {isLoadingUsers ? '⏳' : '🔄'}
                                </button>
                            </div>
                        </div>

                        <div style={styles.tableWrapper}>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.th}>العميل</th>
                                        <th style={styles.th}>الرصيد</th>
                                        <th style={styles.th}>الدور</th>
                                        <th style={styles.th}>تاريخ التسجيل</th>
                                        <th style={styles.th}>إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(u => (
                                        <tr key={u.email} style={styles.tr}>
                                            <td style={styles.td}>
                                                <div style={styles.userCell}>
                                                    <div style={styles.avatar}>
                                                        {u.photoUrl ? (
                                                            <img src={u.photoUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                                        ) : (
                                                            u.name.charAt(0).toUpperCase()
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div style={styles.userName}>{u.name}</div>
                                                        <div style={styles.userEmail}>{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={styles.td}>
                                                <div style={styles.creditCell}>
                                                    <span style={styles.creditBadge}>{u.credits}</span>
                                                    <div style={styles.creditActions}>
                                                        <button style={styles.creditBtn} onClick={() => handleUpdateUser(u.email, u.credits + 10)} title="+10">+10</button>
                                                        <button style={styles.creditBtn} onClick={() => handleUpdateUser(u.email, u.credits + 50)} title="+50">+50</button>
                                                        <button style={{ ...styles.creditBtn, ...styles.creditBtnGold }} onClick={() => handleUpdateUser(u.email, u.credits + 100)} title="+100">+100</button>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={styles.td}>
                                                <span style={u.role === 'admin' ? styles.roleAdmin : styles.roleUser}>
                                                    {u.role === 'admin' ? '👑 مدير' : '👤 عميل'}
                                                </span>
                                            </td>
                                            <td style={styles.td}>
                                                <span style={styles.dateText}>
                                                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                                                </span>
                                            </td>
                                            <td style={styles.td}>
                                                <div style={styles.actionBtns}>
                                                    <button
                                                        style={styles.actionBtn}
                                                        onClick={() => {
                                                            const val = prompt(`تعديل رصيد ${u.name} (الحالي: ${u.credits}):`, u.credits.toString());
                                                            if (val !== null) handleUpdateUser(u.email, parseInt(val, 10));
                                                        }}
                                                    >
                                                        💰 تعديل الرصيد
                                                    </button>
                                                    <button
                                                        style={styles.actionBtn}
                                                        onClick={() => {
                                                            const name = prompt(`تعديل اسم ${u.email}:`, u.name);
                                                            if (name) handleUpdateUser(u.email, u.credits, { name });
                                                        }}
                                                    >
                                                        ✏️ تعديل الاسم
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredUsers.length === 0 && (
                                        <tr>
                                            <td colSpan={5} style={{ ...styles.td, textAlign: 'center', padding: '3rem', color: '#475569' }}>
                                                {searchQuery ? 'لم يتم العثور على نتائج' : 'لا يوجد عملاء مسجلين'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ═══════ TAB: Marketing ═══════ */}
                {activeTab === 'marketing' && (
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>📧 حملات البريد الإلكتروني</h2>
                        <p style={styles.sectionSub}>أرسل رسائل بريد إلكتروني جاهزة أو مخصصة لجميع عملائك ({users.length} عميل)</p>

                        {/* Quick Campaign Buttons */}
                        <div style={styles.campaignGrid}>
                            {/* Welcome Card */}
                            <div style={styles.campaignCard}>
                                <div style={{ ...styles.campaignIcon, background: 'linear-gradient(135deg, #10b981, #059669)' }}>🎉</div>
                                <h3 style={styles.campaignTitle}>رسالة ترحيب</h3>
                                <p style={styles.campaignDesc}>
                                    رسالة ترحيب شاملة للعملاء الجدد تشرح لهم جميع الميزات المتاحة وكيفية البدء باستخدام التطبيق مع التعليمات خطوة بخطوة.
                                </p>
                                <div style={styles.campaignMeta}>
                                    <span style={styles.metaTag}>🌐 عربي</span>
                                    <span style={styles.metaTag}>📖 دليل استخدام</span>
                                </div>
                                <button
                                    style={styles.campaignBtn}
                                    onClick={() => sendCampaign('welcome')}
                                    disabled={isSending}
                                >
                                    {isSending && sendingType === 'welcome' ? '⏳ جارٍ الإرسال...' : '🚀 أرسل رسالة الترحيب'}
                                </button>
                            </div>

                            {/* Retargeting Card */}
                            <div style={styles.campaignCard}>
                                <div style={{ ...styles.campaignIcon, background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>🔔</div>
                                <h3 style={styles.campaignTitle}>إعادة استهداف العملاء</h3>
                                <p style={styles.campaignDesc}>
                                    رسالة لإعادة العملاء غير النشطين. تذكّرهم برصيدهم المتبقي والميزات الجديدة وتحفّزهم على العودة لاستخدام التطبيق.
                                </p>
                                <div style={styles.campaignMeta}>
                                    <span style={styles.metaTag}>🌐 عربي</span>
                                    <span style={styles.metaTag}>🎯 استهداف</span>
                                    <span style={styles.metaTag}>💰 رصيد مخصص</span>
                                </div>
                                <button
                                    style={{ ...styles.campaignBtn, background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                                    onClick={() => sendCampaign('retargeting')}
                                    disabled={isSending}
                                >
                                    {isSending && sendingType === 'retargeting' ? '⏳ جارٍ الإرسال...' : '🔔 أرسل رسالة إعادة الاستهداف'}
                                </button>
                            </div>

                            {/* Weekly Newsletter Card */}
                            <div style={styles.campaignCard}>
                                <div style={{ ...styles.campaignIcon, background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}>📬</div>
                                <h3 style={styles.campaignTitle}>النشرة الأسبوعية</h3>
                                <p style={styles.campaignDesc}>
                                    نشرة أسبوعية تلقائية بمحتوى مختلف كل أسبوع. تتضمن نصائح عملية لاستخدام النماذج الألمانية وفهم المستندات الرسمية.
                                </p>
                                <div style={styles.campaignMeta}>
                                    <span style={styles.metaTag}>🌐 عربي</span>
                                    <span style={styles.metaTag}>🔄 6 مواضيع متناوبة</span>
                                    <span style={styles.metaTag}>⏰ تلقائي كل إثنين</span>
                                </div>
                                <button
                                    style={{ ...styles.campaignBtn, background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}
                                    onClick={() => sendCampaign('weekly-newsletter')}
                                    disabled={isSending}
                                >
                                    {isSending && sendingType === 'weekly-newsletter' ? '⏳ جارٍ الإرسال...' : '📬 أرسل النشرة الأسبوعية الآن'}
                                </button>
                                <p style={{ fontSize: 11, color: '#64748b', margin: '8px 0 0', textAlign: 'center' }}>
                                    ⚡ يتم الإرسال تلقائياً كل يوم إثنين الساعة 9 صباحاً
                                </p>
                            </div>

                            {/* New Feature Newsletter Card */}
                            <div style={styles.campaignCard}>
                                <div style={{ ...styles.campaignIcon, background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}>🆕</div>
                                <h3 style={styles.campaignTitle}>إعلان ميزة جديدة</h3>
                                <p style={styles.campaignDesc}>
                                    أرسل نشرة بريدية تعلن عن ميزة جديدة في التطبيق. تتضمن وصف الميزة ودليل استخدام تفصيلي خطوة بخطوة.
                                </p>
                                <div style={styles.campaignMeta}>
                                    <span style={styles.metaTag}>🌐 عربي</span>
                                    <span style={styles.metaTag}>📖 دليل استخدام</span>
                                    <span style={styles.metaTag}>✏️ مخصص</span>
                                </div>
                                <button
                                    style={{ ...styles.campaignBtn, background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}
                                    onClick={() => setShowFeatureForm(!showFeatureForm)}
                                    disabled={isSending}
                                >
                                    🆕 إنشاء إعلان ميزة جديدة
                                </button>
                            </div>
                        </div>

                        {/* New Feature Form */}
                        {showFeatureForm && (
                            <div style={styles.formCard}>
                                <h3 style={styles.formTitle}>📝 تفاصيل الميزة الجديدة</h3>
                                <div style={styles.formGrid}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.formLabel}>اسم الميزة</label>
                                        <input
                                            style={styles.formInput}
                                            value={featureForm.featureName}
                                            onChange={e => setFeatureForm({ ...featureForm, featureName: e.target.value })}
                                            placeholder="مثال: تحويل الصور إلى PDF"
                                        />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.formLabel}>إيموجي الميزة</label>
                                        <input
                                            style={styles.formInput}
                                            value={featureForm.featureEmoji}
                                            onChange={e => setFeatureForm({ ...featureForm, featureEmoji: e.target.value })}
                                            placeholder="🆕"
                                        />
                                    </div>
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.formLabel}>وصف الميزة</label>
                                    <textarea
                                        style={{ ...styles.formInput, minHeight: 80, resize: 'vertical' as const }}
                                        value={featureForm.featureDescription}
                                        onChange={e => setFeatureForm({ ...featureForm, featureDescription: e.target.value })}
                                        placeholder="اشرح الميزة الجديدة بكلمات بسيطة..."
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.formLabel}>خطوات الاستخدام (دليل)</label>
                                    {featureForm.steps.map((step, i) => (
                                        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                                            <span style={styles.stepBadge}>{i + 1}</span>
                                            <input
                                                style={styles.formInput}
                                                value={step}
                                                onChange={e => {
                                                    const newSteps = [...featureForm.steps];
                                                    newSteps[i] = e.target.value;
                                                    setFeatureForm({ ...featureForm, steps: newSteps });
                                                }}
                                                placeholder={`الخطوة ${i + 1}...`}
                                            />
                                        </div>
                                    ))}
                                    <button
                                        style={styles.addStepBtn}
                                        onClick={() => setFeatureForm({ ...featureForm, steps: [...featureForm.steps, ''] })}
                                    >
                                        ➕ أضف خطوة
                                    </button>
                                </div>
                                <button
                                    style={{ ...styles.campaignBtn, width: '100%', marginTop: 16 }}
                                    onClick={() => sendCampaign('new-feature', {
                                        featureName: featureForm.featureName,
                                        featureEmoji: featureForm.featureEmoji,
                                        featureDescription: featureForm.featureDescription,
                                        steps: featureForm.steps.filter(s => s.trim())
                                    })}
                                    disabled={isSending || !featureForm.featureName || !featureForm.featureDescription}
                                >
                                    {isSending && sendingType === 'new-feature' ? '⏳ جارٍ الإرسال...' : `🚀 أرسل لـ ${users.length} عميل`}
                                </button>
                            </div>
                        )}

                        {/* Divider */}
                        <div style={styles.divider}>
                            <span style={styles.dividerText}>أو أرسل بريد مخصص</span>
                        </div>

                        {/* Custom Email */}
                        <button
                            style={{ ...styles.actionBtn, width: '100%', padding: '14px', justifyContent: 'center', fontSize: 14 }}
                            onClick={() => setShowCustomForm(!showCustomForm)}
                        >
                            ✉️ بريد HTML مخصص
                        </button>

                        {showCustomForm && (
                            <div style={styles.formCard}>
                                <h3 style={styles.formTitle}>✉️ بريد مخصص</h3>
                                <div style={styles.formGroup}>
                                    <label style={styles.formLabel}>عنوان البريد</label>
                                    <input
                                        style={styles.formInput}
                                        value={customSubject}
                                        onChange={e => setCustomSubject(e.target.value)}
                                        placeholder="أدخل عنوان البريد..."
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.formLabel}>محتوى HTML</label>
                                    <textarea
                                        style={{ ...styles.formInput, minHeight: 200, fontFamily: 'monospace', fontSize: 12, resize: 'vertical' as const }}
                                        value={customHtml}
                                        onChange={e => setCustomHtml(e.target.value)}
                                        placeholder="<p>محتوى البريد بتنسيق HTML...</p>"
                                    />
                                </div>
                                <button
                                    style={{ ...styles.campaignBtn, width: '100%', background: 'linear-gradient(135deg, #475569, #334155)' }}
                                    onClick={() => sendCampaign('custom', { subject: customSubject, htmlContent: customHtml })}
                                    disabled={isSending || !customSubject || !customHtml}
                                >
                                    {isSending && sendingType === 'custom' ? '⏳ جارٍ الإرسال...' : `✉️ أرسل لـ ${users.length} عميل`}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <footer style={styles.footer}>
                <p>FormBridge AI Admin Dashboard • استخدام مهني فقط • الوصول غير المصرح به ممنوع</p>
            </footer>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// Premium Inline Styles
// ═══════════════════════════════════════════════════════════════════════════
const styles: Record<string, React.CSSProperties> = {
    pageWrapper: {
        minHeight: '100vh',
        background: '#0a0e1a',
        color: '#e2e8f0',
        direction: 'rtl',
    },
    loadingScreen: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0e1a',
    },
    main: {
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 24px 80px',
    },
    hero: {
        textAlign: 'center',
        padding: '48px 0 36px',
        position: 'relative',
    },
    heroGlow: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        height: 400,
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
    },
    heroTitle: {
        fontSize: 36,
        fontWeight: 800,
        background: 'linear-gradient(135deg, #a5b4fc, #818cf8, #c084fc)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        margin: '0 0 8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    heroIcon: {
        fontSize: 40,
        WebkitTextFillColor: 'initial',
    },
    heroSub: {
        color: '#64748b',
        fontSize: 15,
        margin: '0 0 32px',
    },
    statsRow: {
        display: 'flex',
        justifyContent: 'center',
        gap: 16,
        flexWrap: 'wrap' as const,
    },
    statCard: {
        background: 'rgba(30, 41, 59, 0.7)',
        border: '1px solid #1e293b',
        borderRadius: 14,
        padding: '18px 32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minWidth: 130,
        backdropFilter: 'blur(10px)',
    },
    statNum: {
        fontSize: 28,
        fontWeight: 800,
        color: '#a5b4fc',
    },
    statLabel: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 4,
    },
    alertError: {
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        color: '#fca5a5',
        borderRadius: 12,
        padding: '14px 20px',
        marginBottom: 16,
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
    },
    alertSuccess: {
        background: 'rgba(16, 185, 129, 0.1)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        color: '#6ee7b7',
        borderRadius: 12,
        padding: '14px 20px',
        marginBottom: 16,
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
    },
    tabsContainer: {
        display: 'flex',
        gap: 4,
        marginBottom: 24,
        background: 'rgba(15, 23, 42, 0.6)',
        borderRadius: 14,
        padding: 4,
        border: '1px solid #1e293b',
    },
    tab: {
        flex: 1,
        padding: '14px 20px',
        border: 'none',
        background: 'transparent',
        color: '#64748b',
        fontSize: 15,
        fontWeight: 600,
        cursor: 'pointer',
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        transition: 'all 0.2s ease',
    },
    tabActive: {
        background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
        color: '#a5b4fc',
        border: '1px solid rgba(99,102,241,0.3)',
    },
    section: {
        background: 'rgba(15, 23, 42, 0.5)',
        border: '1px solid #1e293b',
        borderRadius: 20,
        padding: 28,
        backdropFilter: 'blur(20px)',
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        flexWrap: 'wrap' as const,
        gap: 12,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 700,
        color: '#e2e8f0',
        margin: 0,
    },
    sectionSub: {
        color: '#64748b',
        fontSize: 14,
        marginTop: -4,
        marginBottom: 24,
    },
    searchInput: {
        background: '#0f172a',
        border: '1px solid #334155',
        borderRadius: 10,
        padding: '10px 16px',
        color: '#e2e8f0',
        fontSize: 14,
        outline: 'none',
        minWidth: 220,
    },
    refreshBtn: {
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: 10,
        padding: '10px 14px',
        cursor: 'pointer',
        fontSize: 16,
    },
    tableWrapper: {
        overflowX: 'auto' as const,
        borderRadius: 14,
        border: '1px solid #1e293b',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse' as const,
    },
    th: {
        padding: '14px 16px',
        textAlign: 'right' as const,
        fontSize: 12,
        fontWeight: 600,
        color: '#64748b',
        textTransform: 'uppercase' as const,
        letterSpacing: 0.5,
        background: '#0f172a',
        borderBottom: '1px solid #1e293b',
    },
    tr: {
        borderBottom: '1px solid rgba(30, 41, 59, 0.5)',
        transition: 'background 0.15s',
    },
    td: {
        padding: '14px 16px',
        fontSize: 14,
        verticalAlign: 'middle' as const,
    },
    userCell: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 700,
        fontSize: 16,
        flexShrink: 0,
        overflow: 'hidden',
    },
    userName: {
        fontWeight: 600,
        color: '#e2e8f0',
    },
    userEmail: {
        fontSize: 12,
        color: '#475569',
    },
    creditCell: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
    },
    creditBadge: {
        background: 'rgba(99,102,241,0.15)',
        color: '#a5b4fc',
        padding: '4px 12px',
        borderRadius: 8,
        fontWeight: 700,
        fontSize: 16,
        minWidth: 40,
        textAlign: 'center' as const,
    },
    creditActions: {
        display: 'flex',
        gap: 4,
    },
    creditBtn: {
        background: 'rgba(16, 185, 129, 0.1)',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        color: '#6ee7b7',
        borderRadius: 6,
        padding: '3px 8px',
        fontSize: 11,
        fontWeight: 600,
        cursor: 'pointer',
    },
    creditBtnGold: {
        background: 'rgba(245, 158, 11, 0.1)',
        border: '1px solid rgba(245, 158, 11, 0.2)',
        color: '#fbbf24',
    },
    roleAdmin: {
        background: 'rgba(99,102,241,0.15)',
        color: '#a5b4fc',
        padding: '4px 10px',
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 600,
        border: '1px solid rgba(99,102,241,0.2)',
    },
    roleUser: {
        background: 'rgba(71,85,105,0.2)',
        color: '#94a3b8',
        padding: '4px 10px',
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 600,
    },
    dateText: {
        color: '#64748b',
        fontSize: 13,
    },
    actionBtns: {
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap' as const,
    },
    actionBtn: {
        background: 'rgba(30, 41, 59, 0.8)',
        border: '1px solid #334155',
        color: '#94a3b8',
        borderRadius: 8,
        padding: '6px 12px',
        fontSize: 12,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        transition: 'all 0.15s',
    },
    // Marketing tab
    campaignGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 16,
        marginBottom: 28,
    },
    campaignCard: {
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: 16,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
    },
    campaignIcon: {
        width: 52,
        height: 52,
        borderRadius: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 26,
        marginBottom: 16,
    },
    campaignTitle: {
        fontSize: 18,
        fontWeight: 700,
        color: '#e2e8f0',
        margin: '0 0 8px',
    },
    campaignDesc: {
        fontSize: 13,
        color: '#64748b',
        lineHeight: 1.7,
        margin: '0 0 12px',
        flex: 1,
    },
    campaignMeta: {
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap' as const,
        marginBottom: 16,
    },
    metaTag: {
        background: 'rgba(51, 65, 85, 0.5)',
        color: '#94a3b8',
        padding: '3px 8px',
        borderRadius: 6,
        fontSize: 11,
    },
    campaignBtn: {
        background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
        color: 'white',
        border: 'none',
        borderRadius: 10,
        padding: '12px 20px',
        fontWeight: 700,
        fontSize: 14,
        cursor: 'pointer',
        transition: 'all 0.2s',
        width: '100%',
    },
    divider: {
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        margin: '28px 0',
    },
    dividerText: {
        color: '#475569',
        fontSize: 13,
        whiteSpace: 'nowrap' as const,
    },
    formCard: {
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: 16,
        padding: 24,
        marginTop: 16,
    },
    formTitle: {
        fontSize: 18,
        fontWeight: 700,
        color: '#e2e8f0',
        margin: '0 0 20px',
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 120px',
        gap: 12,
        marginBottom: 12,
    },
    formGroup: {
        marginBottom: 12,
    },
    formLabel: {
        display: 'block',
        fontSize: 13,
        color: '#94a3b8',
        fontWeight: 600,
        marginBottom: 6,
    },
    formInput: {
        width: '100%',
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: 10,
        padding: '10px 14px',
        color: '#e2e8f0',
        fontSize: 14,
        outline: 'none',
        boxSizing: 'border-box' as const,
    },
    stepBadge: {
        background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
        color: 'white',
        width: 28,
        height: 28,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: 13,
        flexShrink: 0,
    },
    addStepBtn: {
        background: 'transparent',
        border: '1px dashed #334155',
        borderRadius: 8,
        padding: '8px 16px',
        color: '#64748b',
        fontSize: 13,
        cursor: 'pointer',
        width: '100%',
    },
    footer: {
        textAlign: 'center',
        padding: '24px',
        color: '#334155',
        fontSize: 12,
        borderTop: '1px solid #1e293b',
    },
};
