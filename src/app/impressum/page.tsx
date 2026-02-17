import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Impressum | FormBridge AI',
    description: 'Rechtliche Informationen und Anbieterkennzeichnung für FormBridge AI.',
};

export default function ImpressumPage() {
    return (
        <div style={pageWrapper}>
            <div style={container}>
                {/* Back Link */}
                <Link href="/" style={backLink}>
                    ← Zurück zur Startseite
                </Link>

                {/* Page Title */}
                <h1 style={pageTitle}>Impressum</h1>
                <div style={titleUnderline} />

                {/* Angaben gemäß TMG */}
                <section style={section}>
                    <h2 style={sectionTitle}>Angaben gemäß § 5 TMG</h2>
                    <div style={infoCard}>
                        <p style={companyName}>Yazan-Tech</p>
                        <p style={infoText}>NRW, Deutschland</p>
                    </div>
                </section>

                {/* Kontakt */}
                <section style={section}>
                    <h2 style={sectionTitle}>Kontakt</h2>
                    <div style={infoCard}>
                        <div style={contactRow}>
                            <span style={contactLabel}>E-Mail</span>
                            <a href="mailto:Support@yazan-tech.com" style={contactLink}>
                                Support@yazan-tech.com
                            </a>
                        </div>
                    </div>
                </section>

                {/* Umsatzsteuer */}
                <section style={section}>
                    <h2 style={sectionTitle}>Umsatzsteuer-ID</h2>
                    <p style={bodyText}>
                        Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:
                    </p>
                    <p style={mutedText}>Folgt in Kürze / Wird nachgereicht</p>
                </section>

                {/* EU-Streitschlichtung */}
                <section style={section}>
                    <h2 style={sectionTitle}>EU-Streitschlichtung</h2>
                    <p style={bodyText}>
                        Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
                        <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" style={inlineLink}>
                            https://ec.europa.eu/consumers/odr/
                        </a>
                    </p>
                    <p style={bodyText}>
                        Unsere E-Mail-Adresse finden Sie oben im Impressum.
                    </p>
                </section>

                {/* Verbraucherstreitbeilegung */}
                <section style={{ ...section, borderBottom: 'none' }}>
                    <h2 style={sectionTitle}>Verbraucherstreitbeilegung</h2>
                    <p style={bodyText}>
                        Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
                    </p>
                </section>
            </div>
        </div>
    );
}

/* ── Styles ── */
const pageWrapper: React.CSSProperties = {
    minHeight: '100vh',
    color: '#e2e8f0',
    padding: '3rem 1.5rem',
    fontFamily: "'Inter', sans-serif",
    direction: 'ltr',
};

const container: React.CSSProperties = {
    maxWidth: '720px',
    margin: '0 auto',
};

const backLink: React.CSSProperties = {
    display: 'inline-block',
    color: '#64748b',
    fontSize: '0.85rem',
    textDecoration: 'none',
    marginBottom: '2rem',
};

const pageTitle: React.CSSProperties = {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '2.25rem',
    fontWeight: 700,
    color: '#ffffff',
    marginBottom: '0.75rem',
};

const titleUnderline: React.CSSProperties = {
    width: '3rem',
    height: '3px',
    background: 'linear-gradient(90deg, #0062e6, #14b8a6)',
    borderRadius: '2px',
    marginBottom: '2.5rem',
};

const section: React.CSSProperties = {
    marginBottom: '2rem',
    paddingBottom: '2rem',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
};

const sectionTitle: React.CSSProperties = {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '1.15rem',
    fontWeight: 600,
    color: '#ffffff',
    marginBottom: '0.75rem',
};

const infoCard: React.CSSProperties = {
    padding: '1.25rem 1.5rem',
    borderRadius: '0.75rem',
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.03)',
};

const companyName: React.CSSProperties = {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#ffffff',
    marginBottom: '0.25rem',
};

const infoText: React.CSSProperties = {
    fontSize: '0.9rem',
    color: '#94a3b8',
};

const contactRow: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
};

const contactLabel: React.CSSProperties = {
    fontSize: '0.85rem',
    color: '#64748b',
    minWidth: '4rem',
};

const contactLink: React.CSSProperties = {
    fontSize: '0.9rem',
    color: '#38bdf8',
    textDecoration: 'none',
};

const bodyText: React.CSSProperties = {
    fontSize: '0.9rem',
    lineHeight: 1.8,
    color: '#94a3b8',
    marginBottom: '0.5rem',
};

const mutedText: React.CSSProperties = {
    fontSize: '0.85rem',
    color: '#475569',
    fontStyle: 'italic',
    marginTop: '0.25rem',
};

const inlineLink: React.CSSProperties = {
    color: '#38bdf8',
    textDecoration: 'none',
};
