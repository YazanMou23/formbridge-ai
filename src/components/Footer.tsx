'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';

export default function Footer() {
    const { locale } = useApp();
    const isAr = locale === 'ar';

    return (
        <footer
            style={{
                width: '100%',
                backgroundColor: '#0f172a',
                borderTop: '1px solid #1e293b',
                padding: '2.5rem 0',
                marginTop: 'auto',
                direction: 'ltr',
            }}
        >
            <div
                style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '0 1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '2rem',
                }}
            >
                {/* ── LEFT SIDE: Project Name + Copyright ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span
                        style={{
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: '1.35rem',
                            fontWeight: 700,
                            color: '#ffffff',
                            letterSpacing: '0.02em',
                        }}
                    >
                        FormBridge AI
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        © {new Date().getFullYear()} Yazan-Tech.
                    </span>
                </div>

                {/* ── RIGHT SIDE: Important Links title + list ── */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: '0.75rem',
                    }}
                >
                    <span
                        style={{
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            color: '#ffffff',
                            fontFamily: isAr ? "'Tajawal', sans-serif" : "'Outfit', sans-serif",
                        }}
                    >
                        {isAr ? 'روابط هامة' : 'Wichtige Links'}
                    </span>

                    <nav
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-end',
                            gap: '0.45rem',
                        }}
                    >
                        <Link href="/ueber-uns" style={linkStyle(isAr)}>
                            {isAr ? 'من نحن' : 'Über uns'}
                        </Link>
                        <Link href="/impressum" style={linkStyle(isAr)}>
                            {isAr ? 'بيانات الشركة' : 'Impressum'}
                        </Link>
                        <Link href="/datenschutz" style={linkStyle(isAr)}>
                            {isAr ? 'سياسة الخصوصية' : 'Datenschutz'}
                        </Link>
                    </nav>
                </div>
            </div>
        </footer>
    );
}

function linkStyle(isAr: boolean): React.CSSProperties {
    return {
        fontSize: '0.85rem',
        color: '#94a3b8',
        textDecoration: 'none',
        transition: 'color 0.2s ease',
        fontFamily: isAr ? "'Tajawal', sans-serif" : "'Inter', sans-serif",
    };
}
