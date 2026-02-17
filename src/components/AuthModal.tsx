'use client';

import React, { useState, useEffect } from 'react';
import type { Locale } from '@/types';
import type { User } from '@/types/auth';
import { t } from '@/lib/translations';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (user: User) => void;
    locale: Locale;
}

type Mode = 'login' | 'register';

export default function AuthModal({ isOpen, onClose, onSuccess, locale }: Props) {
    const [mode, setMode] = useState<Mode>('login');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null); // For verification message

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [deviceId, setDeviceId] = useState<string | null>(null);

    useEffect(() => {
        // Initialize FingerprintJS
        const setFp = async () => {
            const fp = await FingerprintJS.load();
            const { visitorId } = await fp.get();
            setDeviceId(visitorId);
        };
        setFp();
    }, []);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
            const body: any = mode === 'login' ? { email, password } : { name, email, password, deviceId };

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!data.success) {
                setError(data.error || t(locale, 'errors.apiError'));
                return;
            }

            if (data.requiresVerification) {
                setSuccessMessage(t(locale, 'auth.checkEmail') || 'Please check your email to verify your account.');
                // Don't close or call onSuccess yet. Wait for them to verify (or just show message).
                return;
            }

            if (data.user) {
                onSuccess(data.user);
                onClose();
            }
        } catch {
            setError(t(locale, 'errors.apiError'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content glass-card animate-slide-up" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>

                <h2 style={{ marginBottom: '0.5rem' }}>
                    {mode === 'login' ? t(locale, 'auth.loginTitle') : t(locale, 'auth.registerTitle')}
                </h2>
                <p style={{ color: 'var(--color-neutral-400)', marginBottom: '1.5rem' }}>
                    {mode === 'login' ? t(locale, 'auth.loginSubtitle') : t(locale, 'auth.registerSubtitle')}
                </p>

                {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

                {successMessage ? (
                    <div className="alert alert-success" style={{ marginBottom: '1rem', backgroundColor: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '0.5rem' }}>
                        {successMessage}
                        <p style={{ marginTop: '0.5rem', fontSize: '0.9em' }}>
                            {locale === 'ar' ? 'يمكنك إغلاق هذه النافذة والتحقق من بريدك الإلكتروني.' : 'You can close this window and check your email.'}
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {mode === 'register' && (
                            <div className="input-group" style={{ marginBottom: '1rem' }}>
                                <label className="input-label">{t(locale, 'auth.name')}</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder={t(locale, 'auth.namePlaceholder')}
                                    required
                                    dir="auto"
                                />
                            </div>
                        )}

                        <div className="input-group" style={{ marginBottom: '1rem' }}>
                            <label className="input-label">{t(locale, 'auth.email')}</label>
                            <input
                                type="email"
                                className="input-field"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder={t(locale, 'auth.emailPlaceholder')}
                                required
                                dir="ltr"
                            />
                        </div>

                        <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                            <label className="input-label">{t(locale, 'auth.password')}</label>
                            <input
                                type="password"
                                className="input-field"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder={t(locale, 'auth.passwordPlaceholder')}
                                required
                                minLength={6}
                                dir="ltr"
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isLoading}>
                            {isLoading ? t(locale, 'common.loading') : (mode === 'login' ? t(locale, 'auth.login') : t(locale, 'auth.register'))}
                        </button>
                    </form>
                )}

                <div className="modal-footer">
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
