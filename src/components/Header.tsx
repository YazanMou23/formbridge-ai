'use client';

import React, { useState } from 'react';
import type { Locale } from '@/types';
import type { User } from '@/types/auth';
import { t } from '@/lib/translations';

interface Props {
    locale: Locale;
    onLocaleChange: (locale: Locale) => void;
    credits: number;
    user: User | null;
    onLoginClick: () => void;
    onLogout: () => void;
    onBuyCredits: () => void;
    onEditProfile: () => void;
}

export default function Header({ locale, onLocaleChange, credits, user, onLoginClick, onLogout, onBuyCredits, onEditProfile }: Props) {
    const [showMenu, setShowMenu] = useState(false);

    return (
        <header className="header">
            <div className="container header__inner">
                <a href="/" className="header__logo">
                    <div className="header__logo-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <span>FormBridge AI</span>
                </a>

                <nav className="header__nav">
                    {/* Credits Badge - Only show when logged in */}
                    {user && (
                        <button className="credit-badge" onClick={onBuyCredits}>
                            <svg className="credit-badge__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 6v12M6 12h12" />
                            </svg>
                            <span className="credit-badge__count">{credits}</span>
                            <span>{t(locale, 'credits.creditsLabel')}</span>
                        </button>
                    )}

                    {/* Language Switcher */}
                    <div className="lang-switcher">
                        <button
                            className={`lang-switcher__btn ${locale === 'ar' ? 'active' : ''}`}
                            onClick={() => onLocaleChange('ar')}
                        >
                            العربية
                        </button>
                        <button
                            className={`lang-switcher__btn ${locale === 'de' ? 'active' : ''}`}
                            onClick={() => onLocaleChange('de')}
                        >
                            Deutsch
                        </button>
                    </div>

                    {/* User Menu */}
                    {user ? (
                        <div className="user-menu">
                            <button className="auth-btn" onClick={() => setShowMenu(!showMenu)}>
                                <span className="auth-btn__avatar" style={{ overflow: 'hidden' }}>
                                    {user.photoUrl ? (
                                        <img src={user.photoUrl} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        user.name.charAt(0).toUpperCase()
                                    )}
                                </span>
                                <span>{user.name}</span>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </button>
                            {showMenu && (
                                <>
                                    <div className="user-menu__backdrop" onClick={() => setShowMenu(false)} />
                                    <div className="user-menu__dropdown">
                                        <div className="user-menu__header">
                                            <span className="user-menu__email">{user.email}</span>
                                        </div>
                                        <button className="user-menu__item" onClick={() => { onBuyCredits(); setShowMenu(false); }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10" />
                                                <path d="M12 6v12M6 12h12" />
                                            </svg>
                                            {t(locale, 'credits.buy')}
                                        </button>
                                        <button className="user-menu__item" onClick={() => { onEditProfile(); setShowMenu(false); }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            {t(locale, 'auth.editProfile')}
                                        </button>
                                        <button className="user-menu__item user-menu__item--danger" onClick={() => { onLogout(); setShowMenu(false); }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                                            </svg>
                                            {t(locale, 'auth.logout')}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <button className="btn btn-primary" onClick={onLoginClick}>
                            {t(locale, 'auth.login')}
                        </button>
                    )}
                </nav>
            </div>
        </header>
    );
}
