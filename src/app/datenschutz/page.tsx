import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Datenschutzerklärung | FormBridge AI',
    description: 'Unsere Datenschutzerklärung - wie wir Ihre Daten schützen.',
};

export default function DatenschutzPage() {
    return (
        <div style={pageWrapper}>
            <div style={container}>
                {/* Back Link */}
                <Link href="/" style={backLink}>
                    ← Zurück zur Startseite
                </Link>

                {/* Page Title */}
                <h1 style={pageTitle}>Datenschutzerklärung</h1>
                <div style={titleUnderline} />

                {/* 1. Datenschutz auf einen Blick */}
                <section style={section}>
                    <h2 style={sectionTitle}>1. Datenschutz auf einen Blick</h2>

                    <h3 style={subTitle}>Allgemeine Hinweise</h3>
                    <p style={bodyText}>
                        Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
                    </p>

                    <h3 style={subTitle}>Datenerfassung auf dieser Website</h3>
                    <div style={qaBlock}>
                        <p style={qaQuestion}>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</p>
                        <p style={bodyText}>
                            Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Impressum dieser Website entnehmen.
                        </p>
                    </div>
                    <div style={qaBlock}>
                        <p style={qaQuestion}>Wie erfassen wir Ihre Daten?</p>
                        <p style={bodyText}>
                            Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z. B. um Daten handeln, die Sie in ein Kontaktformular eingeben oder beim Hochladen von Dokumenten.
                        </p>
                        <p style={bodyText}>
                            Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere IT-Systeme erfasst. Das sind vor allem technische Daten (z. B. Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs).
                        </p>
                    </div>
                    <div style={qaBlock}>
                        <p style={qaQuestion}>Wofür nutzen wir Ihre Daten?</p>
                        <p style={bodyText}>
                            Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu gewährleisten. Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden. Besonders wichtig: Die von Ihnen hochgeladenen Dokumente werden ausschließlich zur Verarbeitung durch unsere KI-Dienste genutzt und nicht dauerhaft gespeichert oder für andere Zwecke verwendet.
                        </p>
                    </div>
                </section>

                {/* 2. Hosting */}
                <section style={section}>
                    <h2 style={sectionTitle}>2. Hosting und Content Delivery Networks (CDN)</h2>
                    <h3 style={subTitle}>Externes Hosting</h3>
                    <p style={bodyText}>
                        Diese Website wird bei einem externen Dienstleister gehostet (Hoster). Die personenbezogenen Daten, die auf dieser Website erfasst werden, werden auf den Servern des Hosters gespeichert.
                    </p>
                    <div style={infoCard}>
                        <p style={infoLabel}>Unser Hoster</p>
                        <p style={infoValue}>
                            Netlify, Inc.<br />
                            44 Montgomery Street, Suite 300<br />
                            San Francisco, California 94104, USA
                        </p>
                    </div>
                </section>

                {/* 3. Allgemeine Hinweise */}
                <section style={section}>
                    <h2 style={sectionTitle}>3. Allgemeine Hinweise und Pflichtinformationen</h2>

                    <h3 style={subTitle}>Datenschutz</h3>
                    <p style={bodyText}>
                        Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
                    </p>

                    <h3 style={subTitle}>Hinweis zur verantwortlichen Stelle</h3>
                    <div style={infoCard}>
                        <p style={infoValue}>
                            Yazan-Tech<br />
                            E-Mail: Support@yazan-tech.com<br />
                            <span style={{ color: '#64748b', fontSize: '0.8rem' }}>(Weitere Kontaktdaten siehe Impressum)</span>
                        </p>
                    </div>
                </section>

                {/* 4. Datenerfassung */}
                <section style={section}>
                    <h2 style={sectionTitle}>4. Datenerfassung auf dieser Website</h2>

                    <h3 style={subTitle}>Server-Log-Dateien</h3>
                    <p style={bodyText}>
                        Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind:
                    </p>
                    <ul style={bulletList}>
                        <li style={bulletItem}>Browsertyp und Browserversion</li>
                        <li style={bulletItem}>Verwendetes Betriebssystem</li>
                        <li style={bulletItem}>Referrer URL</li>
                        <li style={bulletItem}>Hostname des zugreifenden Rechners</li>
                        <li style={bulletItem}>Uhrzeit der Serveranfrage</li>
                        <li style={bulletItem}>IP-Adresse</li>
                    </ul>
                    <p style={bodyText}>
                        Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen.
                    </p>

                    <h3 style={{ ...subTitle, marginTop: '1.5rem' }}>Verarbeitung von Daten</h3>
                    <p style={bodyText}>
                        Wir erheben, verarbeiten und nutzen personenbezogene Daten nur, soweit sie für die Begründung, inhaltliche Ausgestaltung oder Änderung des Rechtsverhältnisses erforderlich sind (Bestandsdaten). Dies erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO.
                    </p>
                </section>

                {/* 5. KI-Dienste */}
                <section style={{ ...section, borderBottom: 'none' }}>
                    <h2 style={sectionTitle}>5. KI-Dienste und Drittanbieter</h2>

                    <div style={serviceCard}>
                        <h3 style={serviceTitle}>OpenAI (API)</h3>
                        <p style={bodyText}>
                            Wir nutzen zur Verarbeitung und Analyse der hochgeladenen Formulare die API von OpenAI. Die übermittelten Texte und Daten werden an Server von OpenAI (USA) übertragen. Wir haben mit OpenAI entsprechende Vereinbarungen zur Auftragsverarbeitung abgeschlossen, die sicherstellen, dass Ihre Daten nur zur Erbringung der Dienstleistung genutzt und nicht für das Training deren Modelle verwendet werden.
                        </p>
                    </div>

                    <div style={{ ...serviceCard, marginTop: '1rem' }}>
                        <h3 style={serviceTitle}>Stripe (Zahlungsabwicklung)</h3>
                        <p style={bodyText}>
                            Für Zahlungsabwicklungen nutzen wir den Dienstleister Stripe. Anbieter ist die Stripe Payments Europe, Ltd., 1 Grand Canal Street Lower, Grand Canal Dock, Dublin, Irland.
                        </p>
                        <p style={bodyText}>
                            Die Übermittlung Ihrer Daten an Stripe erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragsabwicklung) sowie auf unserem berechtigten Interesse an einem sicheren und effizienten Zahlungsprozess (Art. 6 Abs. 1 lit. f DSGVO).
                        </p>
                    </div>
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
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#ffffff',
    marginBottom: '1rem',
};

const subTitle: React.CSSProperties = {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#cbd5e1',
    marginBottom: '0.5rem',
    marginTop: '1rem',
};

const bodyText: React.CSSProperties = {
    fontSize: '0.9rem',
    lineHeight: 1.8,
    color: '#94a3b8',
    marginBottom: '0.5rem',
};

const qaBlock: React.CSSProperties = {
    marginBottom: '1.25rem',
    paddingLeft: '1rem',
    borderLeft: '2px solid rgba(255,255,255,0.06)',
};

const qaQuestion: React.CSSProperties = {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#cbd5e1',
    marginBottom: '0.35rem',
};

const infoCard: React.CSSProperties = {
    padding: '1.25rem 1.5rem',
    borderRadius: '0.75rem',
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.03)',
    marginTop: '0.75rem',
};

const infoLabel: React.CSSProperties = {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.5rem',
};

const infoValue: React.CSSProperties = {
    fontSize: '0.9rem',
    color: '#94a3b8',
    lineHeight: 1.7,
};

const bulletList: React.CSSProperties = {
    listStyle: 'none',
    padding: 0,
    margin: '0.75rem 0 1rem 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
};

const bulletItem: React.CSSProperties = {
    fontSize: '0.85rem',
    color: '#94a3b8',
    paddingLeft: '1.25rem',
    position: 'relative',
};

const serviceCard: React.CSSProperties = {
    padding: '1.25rem 1.5rem',
    borderRadius: '0.75rem',
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.03)',
};

const serviceTitle: React.CSSProperties = {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#ffffff',
    marginBottom: '0.5rem',
};
