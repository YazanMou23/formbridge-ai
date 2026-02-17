'use client';

import React, { useState } from 'react';
import type { Locale } from '@/types';
import { t } from '@/lib/translations';

interface CreditPackage {
    id: string;
    name: string;
    nameAr: string;
    credits: number;
    price: number;
    currency: string;
    popular: boolean;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    locale: Locale;
    isLoggedIn: boolean;
    onLoginRequired: () => void;
}

const PACKAGES: CreditPackage[] = [
    { id: 'starter', name: 'Starter', nameAr: 'المبتدئ', credits: 10, price: 499, currency: 'eur', popular: false },
    { id: 'popular', name: 'Popular', nameAr: 'الأكثر شعبية', credits: 30, price: 999, currency: 'eur', popular: true },
    { id: 'pro', name: 'Professional', nameAr: 'المحترف', credits: 100, price: 2499, currency: 'eur', popular: false },
];

export default function CreditsModal({ isOpen, onClose, locale, isLoggedIn, onLoginRequired }: Props) {
    const [selectedPackage, setSelectedPackage] = useState<string>('popular');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const formatPrice = (cents: number) => {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
        }).format(cents / 100);
    };

    const handlePurchase = async () => {
        if (!isLoggedIn) {
            onLoginRequired();
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/payments/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ packageId: selectedPackage }),
            });

            const data = await res.json();

            if (!data.success) {
                setError(data.error || t(locale, 'errors.apiError'));
                return;
            }

            // Redirect to Stripe Checkout
            if (data.url) {
                window.location.href = data.url;
            }
        } catch {
            setError(t(locale, 'errors.apiError'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content glass-card animate-slide-up credits-modal" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>

                <div className="credits-modal__header">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2>{t(locale, 'credits.buyTitle')}</h2>
                    <p>{t(locale, 'credits.buySubtitle')}</p>
                </div>

                {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

                <div className="credits-packages">
                    {PACKAGES.map(pkg => (
                        <div
                            key={pkg.id}
                            className={`credits-package ${selectedPackage === pkg.id ? 'selected' : ''} ${pkg.popular ? 'popular' : ''}`}
                            onClick={() => setSelectedPackage(pkg.id)}
                        >
                            {pkg.popular && <span className="credits-package__badge">{t(locale, 'credits.mostPopular')}</span>}
                            <h3 className="credits-package__name">
                                {locale === 'ar' ? pkg.nameAr : pkg.name}
                            </h3>
                            <div className="credits-package__credits">
                                <span className="credits-package__number">{pkg.credits}</span>
                                <span className="credits-package__label">{t(locale, 'credits.creditsLabel')}</span>
                            </div>
                            <div className="credits-package__price">{formatPrice(pkg.price)}</div>
                            <div className="credits-package__per">
                                {formatPrice(Math.round(pkg.price / pkg.credits))} / {t(locale, 'credits.perCredit')}
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%', marginTop: '1.5rem' }}
                    onClick={handlePurchase}
                    disabled={isLoading}
                >
                    {isLoading ? t(locale, 'common.loading') : t(locale, 'credits.buyNow')}
                </button>

                <p className="credits-modal__secure">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    {t(locale, 'credits.securePayment')}
                </p>
            </div>
        </div>
    );
}
