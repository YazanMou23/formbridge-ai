'use client';

import React, { useState, useEffect } from 'react';
import type { Locale } from '@/types';
import type { User } from '@/types/auth';
import { t } from '@/lib/translations';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { apiFetch } from '@/lib/apiHelper';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { isNativePlatform, googleSignInNative } from '@/lib/googleAuth';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (user: User) => void;
    locale: Locale;
}

type Mode = 'login' | 'register' | 'forgot';

/* ── Google SVG logo ── */
const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
);

/* ── Inner modal component (must be inside GoogleOAuthProvider) ── */
function AuthModalInner({ isOpen, onClose, onSuccess, locale }: Props) {
    const [mode, setMode] = useState<Mode>('login');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isNative, setIsNative] = useState(false);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [deviceId, setDeviceId] = useState<string | null>(null);

    useEffect(() => {
        const setFp = async () => {
            const fp = await FingerprintJS.load();
            const { visitorId } = await fp.get();
            setDeviceId(visitorId);
        };
        setFp();

        // Detect native platform (Android/iOS)
        try {
            setIsNative(isNativePlatform());
        } catch {
            setIsNative(false);
        }
    }, []);

    /* ── Localized labels ── */
    const forgotLabel = locale === 'ar' ? 'نسيت كلمة المرور؟' : 'Passwort vergessen?';
    const forgotTitle = locale === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Passwort zurücksetzen';
    const forgotSubtitle = locale === 'ar' ? 'أدخل بريدك الإلكتروني لإرسال رابط إعادة التعيين' : 'Geben Sie Ihre E-Mail ein, um den Link zum Zurücksetzen zu erhalten';
    const forgotSubmit = locale === 'ar' ? 'إرسال رابط إعادة التعيين' : 'Link senden';
    const orLabel = locale === 'ar' ? 'أو' : 'oder';
    const closeEmailLabel = locale === 'ar' ? 'يمكنك إغلاق هذه النافذة والتحقق من بريدك الإلكتروني.' : 'Sie können dieses Fenster schließen und Ihre E-Mail überprüfen.';

    const googleBtnText = (() => {
        if (locale === 'ar') return mode === 'register' ? 'التسجيل بحساب Google' : 'تسجيل الدخول بحساب Google';
        return mode === 'register' ? 'Mit Google registrieren' : 'Mit Google anmelden';
    })();

    /* ── Native Google Sign-In (Android/iOS via Capacitor plugin) ── */
    const handleNativeGoogleSignIn = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const googleUser = await googleSignInNative();

            // Send the token to our backend for verification
            // Prefer idToken, fallback to accessToken
            const bodyPayload: any = {};
            if (googleUser.idToken) {
                bodyPayload.credential = googleUser.idToken;
            } else if (googleUser.accessToken) {
                bodyPayload.access_token = googleUser.accessToken;
            } else {
                // No token available – send user info directly for server-side handling
                setError(locale === 'ar' ? 'فشل تسجيل الدخول بحساب Google.' : 'Google-Anmeldung fehlgeschlagen.');
                setIsLoading(false);
                return;
            }

            const res = await apiFetch('/api/auth/google/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyPayload),
            });
            const data = await res.json();

            if (!data.success) {
                setError(data.error || t(locale, 'errors.apiError'));
                setIsLoading(false);
                return;
            }
            if (data.user) {
                if (data.token) localStorage.setItem('auth_token', data.token);
                onSuccess(data.user);
                onClose();
            }
        } catch (e: any) {
            console.error('[Google Native Auth Error]', e);
            
            // Extract detailed error info
            const errorMsg = e?.message || JSON.stringify(e);
            
            // User cancelled the sign-in
            if (errorMsg.toLowerCase().includes('canceled') || errorMsg.toLowerCase().includes('cancelled') || e?.code === 'SIGN_IN_CANCELLED') {
                setIsLoading(false);
                return;
            }
            
            setError(`Google Error: ${errorMsg}`);
            setIsLoading(false);
        }
    };

    /* ── Web Google Login (implicit flow → access_token) ── */
    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await apiFetch('/api/auth/google/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ access_token: tokenResponse.access_token }),
                });
                const data = await res.json();
                if (!data.success) {
                    setError(data.error || t(locale, 'errors.apiError'));
                    setIsLoading(false);
                    return;
                }
                if (data.user) {
                    if (data.token) localStorage.setItem('auth_token', data.token);
                    onSuccess(data.user);
                    onClose();
                }
            } catch (e: any) {
                setError(e.message || t(locale, 'errors.apiError'));
                setIsLoading(false);
            }
        },
        onError: () => setError(locale === 'ar' ? 'فشل تسجيل الدخول بحساب Google.' : 'Google-Anmeldung fehlgeschlagen.'),
    });

    /* ── Email / password submit ── */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            let endpoint = '';
            let body: any = {};

            if (mode === 'login') { endpoint = '/api/auth/login'; body = { email, password }; }
            else if (mode === 'register') { endpoint = '/api/auth/register'; body = { name, email, password, deviceId }; }
            else if (mode === 'forgot') { endpoint = '/api/auth/forgot-password'; body = { email }; }

            const res = await apiFetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await res.json();

            if (!data.success) { setError(data.error || t(locale, 'errors.apiError')); return; }
            if (mode === 'forgot') { setSuccessMessage(data.message || 'Please check your email for the reset link.'); return; }
            if (data.requiresVerification) { setSuccessMessage(t(locale, 'auth.checkEmail') || 'Please check your email to verify your account.'); return; }
            if (data.user) {
                if (data.token) localStorage.setItem('auth_token', data.token);
                onSuccess(data.user);
                onClose();
            }
        } catch (e: any) {
            setError(e.message || t(locale, 'errors.apiError'));
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    /* ── Custom Google button styles ── */
    const googleBtnStyle: React.CSSProperties = {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        background: '#fff',
        color: '#3c4043',
        border: '1px solid #dadce0',
        borderRadius: '0.75rem',
        fontSize: '0.95rem',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'background 0.2s, box-shadow 0.2s',
        height: '48px',
        fontFamily: "'Inter', 'Roboto', sans-serif",
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content glass-card animate-slide-up" onClick={e => e.stopPropagation()} style={{ borderRadius: '1.25rem', padding: '2rem' }}>
                <button className="modal-close" onClick={onClose}>✕</button>

                <h2 style={{ marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: 700 }}>
                    {mode === 'login' ? t(locale, 'auth.loginTitle') : mode === 'register' ? t(locale, 'auth.registerTitle') : forgotTitle}
                </h2>
                <p style={{ color: 'var(--color-neutral-400)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    {mode === 'login' ? t(locale, 'auth.loginSubtitle') : mode === 'register' ? t(locale, 'auth.registerSubtitle') : forgotSubtitle}
                </p>

                {error && <div className="alert alert-error" style={{ marginBottom: '1rem', borderRadius: '0.75rem' }}>{error}</div>}

                {successMessage ? (
                    <div style={{
                        marginBottom: '1rem',
                        background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(52,211,153,0.1))',
                        color: '#6ee7b7', padding: '1.25rem', borderRadius: '0.75rem',
                        border: '1px solid rgba(16,185,129,0.3)', textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📧</div>
                        <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{successMessage}</p>
                        <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>{closeEmailLabel}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {mode === 'register' && (
                            <div className="input-group" style={{ marginBottom: '1rem' }}>
                                <label className="input-label">{t(locale, 'auth.name')}</label>
                                <input type="text" className="input-field" value={name} onChange={e => setName(e.target.value)}
                                    placeholder={t(locale, 'auth.namePlaceholder')} required dir="auto" style={{ borderRadius: '0.75rem' }} />
                            </div>
                        )}

                        <div className="input-group" style={{ marginBottom: '1rem' }}>
                            <label className="input-label">{t(locale, 'auth.email')}</label>
                            <input type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)}
                                placeholder={t(locale, 'auth.emailPlaceholder')} required dir="ltr" style={{ borderRadius: '0.75rem' }} />
                        </div>

                        {mode !== 'forgot' && (
                            <div className="input-group" style={{ marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                    <label className="input-label" style={{ marginBottom: 0 }}>{t(locale, 'auth.password')}</label>
                                    {mode === 'login' && (
                                        <button type="button" onClick={() => { setMode('forgot'); setError(null); setSuccessMessage(null); }}
                                            style={{ background: 'none', border: 'none', color: 'var(--color-primary-400)', fontSize: '0.8rem', cursor: 'pointer', padding: 0, fontWeight: 500 }}>
                                            {forgotLabel}
                                        </button>
                                    )}
                                </div>
                                <input type="password" className="input-field" value={password} onChange={e => setPassword(e.target.value)}
                                    placeholder={t(locale, 'auth.passwordPlaceholder')} required minLength={6} dir="ltr" style={{ borderRadius: '0.75rem' }} />
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary"
                            style={{ width: '100%', borderRadius: '0.75rem', height: '48px', fontSize: '1rem', fontWeight: 600 }}
                            disabled={isLoading}>
                            {isLoading ? t(locale, 'common.loading') : (mode === 'login' ? t(locale, 'auth.login') : mode === 'register' ? t(locale, 'auth.register') : forgotSubmit)}
                        </button>
                    </form>
                )}

                {/* ── Google button at bottom ── */}
                {mode !== 'forgot' && !successMessage && (
                    <div style={{ marginTop: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', margin: '0 0 1rem 0' }}>
                            <div style={{ flex: 1, height: '1px', background: 'var(--color-neutral-700)' }}></div>
                            <span style={{ margin: '0 0.75rem', color: 'var(--color-neutral-400)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{orLabel}</span>
                            <div style={{ flex: 1, height: '1px', background: 'var(--color-neutral-700)' }}></div>
                        </div>

                        <button
                            type="button"
                            onClick={() => isNative ? handleNativeGoogleSignIn() : googleLogin()}
                            disabled={isLoading}
                            style={googleBtnStyle}
                            onMouseEnter={e => { (e.target as HTMLButtonElement).style.background = '#f7f8f8'; (e.target as HTMLButtonElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.15)'; }}
                            onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = '#fff'; (e.target as HTMLButtonElement).style.boxShadow = 'none'; }}
                        >
                            <GoogleIcon />
                            <span>{googleBtnText}</span>
                        </button>
                    </div>
                )}

                <div className="modal-footer" style={{ marginTop: '1.25rem', paddingTop: '1rem' }}>
                    {mode === 'login' ? (
                        <p>
                            {t(locale, 'auth.noAccount')}{' '}
                            <button className="link-btn" onClick={() => { setMode('register'); setError(null); setSuccessMessage(null); }}>
                                {t(locale, 'auth.registerNow')}
                            </button>
                        </p>
                    ) : (
                        <p>
                            {t(locale, 'auth.hasAccount')}{' '}
                            <button className="link-btn" onClick={() => { setMode('login'); setError(null); setSuccessMessage(null); }}>
                                {t(locale, 'auth.loginNow')}
                            </button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ── Wrapper that provides GoogleOAuthProvider ── */
export default function AuthModal(props: Props) {
    if (!props.isOpen) return null;
    return (
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
            <AuthModalInner {...props} />
        </GoogleOAuthProvider>
    );
}
