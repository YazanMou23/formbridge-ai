// ═══════════════════════════════════════════════════════════════════════════
// FormBridge AI - Stripe Configuration
// ═══════════════════════════════════════════════════════════════════════════

import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
    if (!_stripe) {
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error('STRIPE_SECRET_KEY is not set');
        }
        _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2026-01-28.clover',
        });
    }
    return _stripe;
}

// Keep backward compatibility
export const stripe = new Proxy({} as Stripe, {
    get(_target, prop) {
        return (getStripe() as any)[prop];
    },
});

// Credit packages configuration
export const CREDIT_PACKAGES = [
    {
        id: 'starter',
        name: 'Starter',
        nameAr: 'المبتدئ',
        credits: 10,
        price: 499, // in cents (€4.99)
        currency: 'eur',
        popular: false,
    },
    {
        id: 'popular',
        name: 'Popular',
        nameAr: 'الأكثر شعبية',
        credits: 30,
        price: 999, // €9.99
        currency: 'eur',
        popular: true,
    },
    {
        id: 'pro',
        name: 'Professional',
        nameAr: 'المحترف',
        credits: 100,
        price: 2499, // €24.99
        currency: 'eur',
        popular: false,
    },
] as const;

export type CreditPackageId = typeof CREDIT_PACKAGES[number]['id'];

export function getPackageById(id: string) {
    return CREDIT_PACKAGES.find(p => p.id === id);
}

export function formatPrice(cents: number, currency: string = 'eur'): string {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: currency.toUpperCase(),
    }).format(cents / 100);
}
