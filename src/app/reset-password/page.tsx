'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    if (!token) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                minHeight: '100vh', background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
                padding: '1.5rem'
            }}>
                <div style={{
                    textAlign: 'center', padding: '2.5rem', maxWidth: '420px', width: '100%',
                    background: 'rgba(30, 41, 59, 0.8)', borderRadius: '1.25rem',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.4)'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                    <p style={{ color: '#f87171', fontSize: '1.1rem', fontWeight: 600 }}>رابط غير صالح</p>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.5rem' }}>Invalid or expired link</p>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirm) {
            setStatus('error');
            setMessage('كلمتا المرور غير متطابقتين / Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setStatus('error');
            setMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            return;
        }

        setStatus('loading');

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            });

            const data = await res.json();

            if (data.success) {
                setStatus('success');
                setMessage('تم إعادة تعيين كلمة المرور بنجاح!');
            } else {
                setStatus('error');
                setMessage(data.error || 'حدث خطأ. يرجى المحاولة لاحقاً.');
            }
        } catch {
            setStatus('error');
            setMessage('حدث خطأ. يرجى المحاولة لاحقاً.');
        }
    };

    const cardStyle: React.CSSProperties = {
        maxWidth: '420px',
        width: '100%',
        background: 'rgba(30, 41, 59, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRadius: '1.25rem',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
        padding: '2.5rem',
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        background: 'rgba(15, 23, 42, 0.6)',
        color: '#f1f5f9',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '0.75rem',
        padding: '0.875rem 1rem',
        fontSize: '1rem',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        textAlign: 'left' as const,
        direction: 'ltr' as const,
        boxSizing: 'border-box' as const,
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        color: '#cbd5e1',
        fontSize: '0.875rem',
        fontWeight: 500,
        marginBottom: '0.5rem',
    };

    const btnStyle: React.CSSProperties = {
        width: '100%',
        background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
        color: 'white',
        fontWeight: 700,
        fontSize: '1rem',
        padding: '0.875rem',
        borderRadius: '0.75rem',
        border: 'none',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
    };

    if (status === 'success') {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                minHeight: '100vh', background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
                padding: '1.5rem'
            }}>
                <div style={{ ...cardStyle, textAlign: 'center' }}>
                    <div style={{
                        width: '72px', height: '72px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #10b981, #34d399)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1.5rem', fontSize: '2rem',
                        boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
                    }}>✓</div>
                    <h2 style={{ color: '#f1f5f9', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                        {message}
                    </h2>
                    <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '0.9rem', lineHeight: 1.6 }}>
                        يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة
                        <br />
                        You can now log in with your new password
                    </p>
                    <a href="/" style={{
                        ...btnStyle,
                        display: 'inline-block',
                        textDecoration: 'none',
                        textAlign: 'center',
                    }}>
                        العودة للرئيسية
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: '100vh', background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
            padding: '1.5rem'
        }}>
            <div style={cardStyle} dir="rtl">
                {/* Icon */}
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(99,102,241,0.2))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto', fontSize: '1.5rem',
                        border: '1px solid rgba(99,102,241,0.3)',
                    }}>🔒</div>
                </div>

                <h2 style={{ color: '#f1f5f9', fontSize: '1.5rem', fontWeight: 700, textAlign: 'center', marginBottom: '0.5rem' }}>
                    إعادة تعيين كلمة المرور
                </h2>
                <p style={{ color: '#94a3b8', textAlign: 'center', marginBottom: '1.75rem', fontSize: '0.9rem' }}>
                    أدخل كلمة المرور الجديدة الخاصة بك.
                </p>

                {status === 'error' && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#fca5a5',
                        padding: '1rem',
                        borderRadius: '0.75rem',
                        marginBottom: '1.25rem',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        fontSize: '0.9rem',
                        textAlign: 'center',
                    }}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={labelStyle}>كلمة المرور الجديدة</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            style={inputStyle}
                            required
                            placeholder="••••••••"
                            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={labelStyle}>تأكيد كلمة المرور</label>
                        <input
                            type="password"
                            value={confirm}
                            onChange={e => setConfirm(e.target.value)}
                            style={inputStyle}
                            required
                            placeholder="••••••••"
                            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        style={{
                            ...btnStyle,
                            opacity: status === 'loading' ? 0.6 : 1,
                            cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {status === 'loading' ? 'جاري التحميل...' : 'تحديث كلمة المرور'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                minHeight: '100vh', background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
                color: '#94a3b8',
            }}>
                Loading...
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}
