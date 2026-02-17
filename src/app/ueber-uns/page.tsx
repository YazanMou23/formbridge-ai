import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Über uns | FormBridge AI',
    description: 'Erfahren Sie mehr über unsere Mission, komplexe deutsche Bürokratie einfach und verständlich zu machen.',
};

export default function AboutPage() {
    return (
        <div style={pageWrapper}>
            <div style={container}>
                {/* Back Link */}
                <Link href="/" style={backLink}>
                    ← Zurück zur Startseite
                </Link>

                {/* Page Title */}
                <h1 style={pageTitle}>Über uns</h1>
                <div style={titleUnderline} />

                {/* Intro */}
                <p style={introText}>
                    Willkommen bei <strong style={{ color: '#fff' }}>FormBridge AI</strong>. Unsere Mission ist es, bürokratische Hürden abzubauen und den Alltag in Deutschland einfacher zu gestalten.
                </p>

                {/* Section: Das Problem */}
                <section style={section}>
                    <h2 style={sectionTitle}>Das Problem</h2>
                    <p style={sectionText}>
                        Jeder, der neu in Deutschland ist, kennt es: Der Briefkasten ist voll mit offiziellen Schreiben in komplexem &quot;Behördendeutsch&quot;. Formulare sind oft schwer verständlich, selbst für Muttersprachler. Für Nicht-Muttersprachler werden sie oft zu einer unüberwindbaren Hürde, die Stress und Unsicherheit verursacht.
                    </p>
                </section>

                {/* Section: Unsere Lösung */}
                <section style={section}>
                    <h2 style={sectionTitle}>Unsere Lösung</h2>
                    <p style={sectionText}>
                        Mit modernster Künstlicher Intelligenz (KI) übersetzen und erklären wir nicht nur Formulare, sondern helfen aktiv beim Ausfüllen. Sie laden ein Foto hoch, die KI erkennt die Fragen, und Sie können in Ihrer Muttersprache antworten. Das Ergebnis ist ein korrekt ausgefülltes deutsches Formular – bereit zur Abgabe.
                    </p>
                </section>

                {/* Values Grid */}
                <section style={{ marginTop: '2.5rem' }}>
                    <h2 style={sectionTitle}>Unsere Werte</h2>
                    <div style={grid}>
                        <div style={valueCard}>
                            <div style={valueIcon}>⚡</div>
                            <h3 style={valueTitle}>Einfachheit</h3>
                            <p style={valueText}>Kein Wörterbuch nötig. Intuitive Bedienung und direkte Übersetzung.</p>
                        </div>
                        <div style={valueCard}>
                            <div style={valueIcon}>🔒</div>
                            <h3 style={valueTitle}>Sicherheit</h3>
                            <p style={valueText}>Datenschutz steht bei uns an erster Stelle. Ihre Daten dienen nur dem Zweck der Bearbeitung.</p>
                        </div>
                        <div style={valueCard}>
                            <div style={valueIcon}>🚀</div>
                            <h3 style={valueTitle}>Schnelligkeit</h3>
                            <p style={valueText}>Sparen Sie Stunden an Recherche und Übersetzungsarbeit.</p>
                        </div>
                        <div style={valueCard}>
                            <div style={valueIcon}>🎯</div>
                            <h3 style={valueTitle}>Genauigkeit</h3>
                            <p style={valueText}>Präzise KI-Modelle sorgen für korrekte Zuordnungen im Formular.</p>
                        </div>
                    </div>
                </section>

                {/* Quote */}
                <div style={quoteBlock}>
                    <p style={quoteText}>
                        &quot;Wir bauen Brücken durch den Papierkram.&quot;
                    </p>
                    <p style={quoteAuthor}>— Das Team von FormBridge AI</p>
                </div>
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
    transition: 'color 0.2s',
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
    marginBottom: '2rem',
};

const introText: React.CSSProperties = {
    fontSize: '1.1rem',
    lineHeight: 1.8,
    color: '#94a3b8',
    marginBottom: '2.5rem',
};

const section: React.CSSProperties = {
    marginBottom: '2rem',
    paddingBottom: '2rem',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
};

const sectionTitle: React.CSSProperties = {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#ffffff',
    marginBottom: '0.75rem',
};

const sectionText: React.CSSProperties = {
    fontSize: '0.95rem',
    lineHeight: 1.8,
    color: '#94a3b8',
};

const grid: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1.25rem',
    marginTop: '1.25rem',
};

const valueCard: React.CSSProperties = {
    padding: '1.5rem',
    borderRadius: '0.75rem',
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.03)',
};

const valueIcon: React.CSSProperties = {
    fontSize: '1.5rem',
    marginBottom: '0.75rem',
};

const valueTitle: React.CSSProperties = {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#ffffff',
    marginBottom: '0.35rem',
};

const valueText: React.CSSProperties = {
    fontSize: '0.85rem',
    color: '#64748b',
    lineHeight: 1.6,
};

const quoteBlock: React.CSSProperties = {
    marginTop: '3rem',
    padding: '2rem',
    borderLeft: '3px solid #14b8a6',
    backgroundColor: 'rgba(20,184,166,0.05)',
    borderRadius: '0 0.75rem 0.75rem 0',
};

const quoteText: React.CSSProperties = {
    fontSize: '1.1rem',
    fontStyle: 'italic',
    color: '#cbd5e1',
    marginBottom: '0.5rem',
};

const quoteAuthor: React.CSSProperties = {
    fontSize: '0.85rem',
    color: '#64748b',
};
