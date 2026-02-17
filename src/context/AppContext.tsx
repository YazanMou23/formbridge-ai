'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Locale, AppStep, AppContextType } from '@/types';

// ═══════════════════════════════════════════════════════════════════════════
// App Context - Global State Management
// ═══════════════════════════════════════════════════════════════════════════

const INITIAL_CREDITS = 10; // Free credits for new users
const CREDITS_STORAGE_KEY = 'formbridge_credits';

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
    children: ReactNode;
    initialLocale?: Locale;
}

export function AppProvider({ children, initialLocale = 'ar' }: AppProviderProps) {
    const [locale, setLocaleState] = useState<Locale>(initialLocale);
    const [credits, setCredits] = useState<number>(() => {
        // Initialize from localStorage if available (client-side only)
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(CREDITS_STORAGE_KEY);
            return stored ? parseInt(stored, 10) : INITIAL_CREDITS;
        }
        return INITIAL_CREDITS;
    });
    const [step, setStep] = useState<AppStep>('upload');

    // Update locale and document direction
    const setLocale = useCallback((newLocale: Locale) => {
        setLocaleState(newLocale);
        if (typeof document !== 'undefined') {
            document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr';
            document.documentElement.lang = newLocale;
        }
    }, []);

    // Deduct credits with validation
    const deductCredits = useCallback((amount: number): boolean => {
        if (credits < amount) {
            return false; // Insufficient credits
        }

        const newBalance = credits - amount;
        setCredits(newBalance);

        // Persist to localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem(CREDITS_STORAGE_KEY, newBalance.toString());
        }

        return true;
    }, [credits]);

    const value: AppContextType = {
        locale,
        setLocale,
        credits,
        deductCredits,
        step,
        setStep,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

// Custom hook for consuming the context
export function useApp(): AppContextType {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}

// Export individual hooks for specific state
export function useLocale(): [Locale, (locale: Locale) => void] {
    const { locale, setLocale } = useApp();
    return [locale, setLocale];
}

export function useCredits(): [number, (amount: number) => boolean] {
    const { credits, deductCredits } = useApp();
    return [credits, deductCredits];
}

export function useStep(): [AppStep, (step: AppStep) => void] {
    const { step, setStep } = useApp();
    return [step, setStep];
}
