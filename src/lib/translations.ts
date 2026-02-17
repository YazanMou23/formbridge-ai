// ═══════════════════════════════════════════════════════════════════════════
// FormBridge AI - Translation Utilities
// ═══════════════════════════════════════════════════════════════════════════

import type { Locale } from '@/types';
import arMessages from '@/i18n/messages/ar.json';
import deMessages from '@/i18n/messages/de.json';

type Messages = typeof arMessages;

const messages: Record<Locale, Messages> = {
    ar: arMessages,
    de: deMessages,
};

/**
 * Get a nested translation value by dot-notation key
 * @example t('ar', 'hero.title') => 'عبّئ النماذج الألمانية بسهولة'
 */
export function t(locale: Locale, key: string): string {
    const keys = key.split('.');
    let value: unknown = messages[locale];

    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = (value as Record<string, unknown>)[k];
        } else {
            console.warn(`Translation missing: ${key} for locale ${locale}`);
            return key;
        }
    }

    return typeof value === 'string' ? value : key;
}

/**
 * Create a translator function bound to a specific locale
 */
export function createTranslator(locale: Locale) {
    return (key: string) => t(locale, key);
}

/**
 * Get all messages for a locale
 */
export function getMessages(locale: Locale): Messages {
    return messages[locale];
}

/**
 * Check if a locale uses RTL direction
 */
export function isRTL(locale: Locale): boolean {
    return locale === 'ar';
}

/**
 * Get the text direction for a locale
 */
export function getDirection(locale: Locale): 'ltr' | 'rtl' {
    return isRTL(locale) ? 'rtl' : 'ltr';
}
