'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { t } from '@/lib/translations';
import Header from '@/components/Header';
import AuthModal from '@/components/AuthModal';
import CreditsModal from '@/components/CreditsModal';
import FormFiller from '@/components/FormFiller';
import DocumentExplainer from '@/components/DocumentExplainer';
import CVBuilder from '@/components/CVBuilder';
import PdfEditor from '@/components/PdfEditor';
import ImageToPdf from '@/components/ImageToPdf';
import HistoryView from '@/components/HistoryView';
import ProfileModal from '@/components/ProfileModal';
import type { User } from '@/types/auth';

function HomePageContent() {
  const searchParams = useSearchParams();
  const { locale, setLocale, credits } = useApp();

  // Feature selection state
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userCredits, setUserCredits] = useState(credits);

  // Payment status
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'cancelled' | null>(null);
  const [addedCredits, setAddedCredits] = useState<number>(0);

  useEffect(() => {
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
  }, [locale]);

  // Verification status
  const [verificationStatus, setVerificationStatus] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    const payment = searchParams.get('payment');
    const creditsAdded = searchParams.get('credits');
    const verified = searchParams.get('verified');
    const error = searchParams.get('error');

    if (payment === 'success' && creditsAdded) {
      setPaymentStatus('success');
      setAddedCredits(parseInt(creditsAdded, 10));
      checkSession();
      setTimeout(() => {
        window.history.replaceState({}, '', '/');
        setPaymentStatus(null);
      }, 5000);
    } else if (payment === 'cancelled') {
      setPaymentStatus('cancelled');
      setTimeout(() => {
        window.history.replaceState({}, '', '/');
        setPaymentStatus(null);
      }, 5000);
    }

    if (verified === 'true') {
      setVerificationStatus('success');
      checkSession(); // Re-check session as verification logs them in
      setTimeout(() => {
        window.history.replaceState({}, '', '/');
        setVerificationStatus(null);
      }, 5000);
    } else if (error === 'invalid_token' || error === 'missing_token') {
      setVerificationStatus('error');
      setTimeout(() => {
        window.history.replaceState({}, '', '/');
        setVerificationStatus(null);
      }, 5000);
    }
  }, [searchParams]);

  const checkSession = async () => {
    try {
      const tabSessionActive = sessionStorage.getItem('formbridge_tab_session');
      if (!tabSessionActive) {
        await fetch('/api/auth/logout', { method: 'POST' });
        setUser(null);
        setAuthLoading(false);
        return;
      }

      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        setUserCredits(data.user.credits);
      } else {
        sessionStorage.removeItem('formbridge_tab_session');
      }
    } catch {
      sessionStorage.removeItem('formbridge_tab_session');
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const handleAuthSuccess = (userData: User) => {
    sessionStorage.setItem('formbridge_tab_session', 'active');
    setUser(userData);
    setUserCredits(userData.credits);
    setShowAuthModal(false);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      sessionStorage.removeItem('formbridge_tab_session');
      setUser(null);
      setUserCredits(credits);
      setSelectedFeature(null);
    } catch {
      // Ignore
    }
  };

  if (authLoading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <>
      <Header
        locale={locale}
        onLocaleChange={setLocale}
        credits={userCredits}
        user={user}
        onLoginClick={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        onBuyCredits={() => setShowCreditsModal(true)}
        onEditProfile={() => setShowProfileModal(true)}
      />

      <main className="container">
        <section className="hero">
          <h1 className="hero__title">{t(locale, 'hero.title')}</h1>
          <p className="hero__subtitle">{t(locale, 'hero.subtitle')}</p>
        </section>

        {/* Payment Status Notifications */}
        {paymentStatus === 'success' && (
          <div className="payment-status payment-status--success animate-fade-in">
            <svg className="payment-status__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t(locale, 'credits.paymentSuccess')} (+{addedCredits} {t(locale, 'credits.creditsLabel')})
          </div>
        )}

        {/* Verification Status Notifications */}
        {verificationStatus === 'success' && (
          <div className="payment-status payment-status--success animate-fade-in" style={{ backgroundColor: '#dcfce7', color: '#166534', borderColor: '#bbf7d0' }}>
            <svg className="payment-status__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {locale === 'ar' ? 'تم التحقق من بريدك الإلكتروني بنجاح!' : 'Email verified successfully!'}
          </div>
        )}
        {verificationStatus === 'error' && (
          <div className="payment-status animate-fade-in" style={{ backgroundColor: '#fee2e2', color: '#991b1b', borderColor: '#fecaca' }}>
            <svg className="payment-status__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {locale === 'ar' ? 'فشل التحقق من البريد الإلكتروني. الرابط غير صالح.' : 'Email verification failed. Invalid token.'}
          </div>
        )}

        {!user ? (
          /* Auth Required Screen */
          <div className="auth-required glass-card animate-slide-up" style={{ marginBottom: '5rem' }}>
            <div className="auth-required__icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 15v2m0 0v2m0-2h2m-2 0H10m7-7V7a5 5 0 00-10 0v4m-2 0h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2z" />
              </svg>
            </div>
            <h2>{t(locale, 'auth.requiredTitle')}</h2>
            <p>{t(locale, 'auth.requiredSubtitle')}</p>
            <div className="auth-required__actions">
              <button className="btn btn-primary btn-lg" onClick={() => setShowAuthModal(true)}>
                {t(locale, 'auth.login')}
              </button>
            </div>
          </div>
        ) : (
          /* Feature Selection or Active Feature */
          <div className="main-content">
            {!selectedFeature ? (
              /* Feature Selection List */
              <div className="feature-list animate-fade-in" style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                marginTop: '3rem',
                maxWidth: '800px',
                marginLeft: 'auto',
                marginRight: 'auto'
              }}>
                {/* 1. Form Filling */}
                <div
                  className="feature-card glass-card hover-lift"
                  onClick={() => setSelectedFeature('form')}
                  style={{
                    cursor: 'pointer',
                    padding: '1.5rem',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    textAlign: locale === 'ar' ? 'right' : 'left',
                    position: 'relative'
                  }}
                >
                  <div className="feature-icon" style={{
                    background: 'var(--color-primary-600)',
                    width: '56px', height: '56px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    [locale === 'ar' ? 'marginLeft' : 'marginRight']: '1.5rem',
                    fontSize: '1.75rem'
                  }}>
                    📝
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: 'white' }}>
                      {locale === 'ar' ? 'تعبئة النماذج' : 'Formular ausfüllen'}
                    </h3>
                    <p style={{ color: 'var(--color-neutral-400)', margin: 0, fontSize: '0.95rem' }}>
                      {locale === 'ar'
                        ? 'املأ الاستمارات الحكومية الألمانية وعقود العمل بسهولة'
                        : 'Füllen Sie deutsche Behördenformulare und Verträge einfach aus'}
                    </p>
                  </div>
                </div>

                {/* 2. Document Explainer */}
                <div
                  className="feature-card glass-card hover-lift"
                  onClick={() => setSelectedFeature('explain')}
                  style={{
                    cursor: 'pointer',
                    padding: '1.5rem',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    textAlign: locale === 'ar' ? 'right' : 'left',
                    position: 'relative'
                  }}
                >
                  <div className="feature-icon" style={{
                    background: 'var(--color-accent-600)',
                    width: '56px', height: '56px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    [locale === 'ar' ? 'marginLeft' : 'marginRight']: '1.5rem',
                    fontSize: '1.75rem'
                  }}>
                    💡
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: 'white' }}>
                      {locale === 'ar' ? 'شرح المستندات' : 'Dokumentenerklärung'}
                    </h3>
                    <p style={{ color: 'var(--color-neutral-400)', margin: 0, fontSize: '0.95rem' }}>
                      {locale === 'ar'
                        ? 'شرح مبسط للمستندات المعقدة باللهجة السورية'
                        : 'Einfache Erklärung komplexer Dokumente im syrischen Dialekt'}
                    </p>
                  </div>
                  <span className="badge badge-new" style={{
                    background: 'var(--color-accent-500)', color: 'white',
                    padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem',
                    position: 'absolute', top: '1rem', [locale === 'ar' ? 'left' : 'right']: '1rem'
                  }}>
                    NEW
                  </span>
                </div>

                {/* 3. CV Builder */}
                <div
                  className="feature-card glass-card hover-lift"
                  onClick={() => setSelectedFeature('cv')}
                  style={{
                    cursor: 'pointer',
                    padding: '1.5rem',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    textAlign: locale === 'ar' ? 'right' : 'left',
                    position: 'relative'
                  }}
                >
                  <div className="feature-icon" style={{
                    background: 'var(--color-success-600)',
                    width: '56px', height: '56px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    [locale === 'ar' ? 'marginLeft' : 'marginRight']: '1.5rem',
                    fontSize: '1.75rem'
                  }}>
                    👔
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: 'white' }}>
                      {locale === 'ar' ? 'إنشاء سيرة ذاتية' : 'Lebenslauf erstellen'}
                    </h3>
                    <p style={{ color: 'var(--color-neutral-400)', margin: 0, fontSize: '0.95rem' }}>
                      {locale === 'ar'
                        ? 'أنشئ سيرة ذاتية بتصميم احترافي أو متوافق مع نظام ATS'
                        : 'Erstellen Sie professionelle oder ATS-optimierte Lebensläufe'}
                    </p>
                  </div>
                  <span className="badge badge-new" style={{
                    background: 'var(--color-accent-500)', color: 'white',
                    padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem',
                    position: 'absolute', top: '1rem', [locale === 'ar' ? 'left' : 'right']: '1rem'
                  }}>
                    NEW
                  </span>
                </div>

                {/* 4. PDF Editor & Sign */}
                <div
                  className="feature-card glass-card hover-lift"
                  onClick={() => setSelectedFeature('pdf-edit')}
                  style={{
                    cursor: 'pointer',
                    padding: '1.5rem',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    textAlign: locale === 'ar' ? 'right' : 'left',
                    position: 'relative'
                  }}
                >
                  <div className="feature-icon" style={{
                    background: 'var(--color-secondary-600)',
                    width: '56px', height: '56px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    [locale === 'ar' ? 'marginLeft' : 'marginRight']: '1.5rem',
                    fontSize: '1.75rem'
                  }}>
                    ✍️
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: 'white' }}>
                      {locale === 'ar' ? 'تعديل وتوقيع PDF' : 'PDF bearbeiten & unterschreiben'}
                    </h3>
                    <p style={{ color: 'var(--color-neutral-400)', margin: 0, fontSize: '0.95rem' }}>
                      {locale === 'ar'
                        ? 'ارفع ملف PDF، أضف نصوصاً وتوقيعك الشخصي'
                        : 'PDF hochladen, Text und Unterschrift hinzufügen'}
                    </p>
                  </div>
                </div>

                {/* 5. Image to PDF */}
                <div
                  className="feature-card glass-card hover-lift"
                  onClick={() => setSelectedFeature('image-pdf')}
                  style={{
                    cursor: 'pointer',
                    padding: '1.5rem',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    textAlign: locale === 'ar' ? 'right' : 'left',
                    position: 'relative'
                  }}
                >
                  <div className="feature-icon" style={{
                    background: 'var(--color-warning-600)',
                    width: '56px', height: '56px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    [locale === 'ar' ? 'marginLeft' : 'marginRight']: '1.5rem',
                    fontSize: '1.75rem'
                  }}>
                    🖼️
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: 'white' }}>
                      {locale === 'ar' ? 'صورة إلى PDF' : 'Bild zu PDF'}
                    </h3>
                    <p style={{ color: 'var(--color-neutral-400)', margin: 0, fontSize: '0.95rem' }}>
                      {locale === 'ar'
                        ? 'قص وتدوير الصور وتحويلها إلى مستند PDF'
                        : 'Bilder zuschneiden, drehen und in PDF umwandeln'}
                    </p>
                  </div>
                </div>
                {/* 6. History */}
                <div
                  className="feature-card glass-card hover-lift"
                  onClick={() => setSelectedFeature('history')}
                  style={{
                    cursor: 'pointer',
                    padding: '1.5rem',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    textAlign: locale === 'ar' ? 'right' : 'left',
                    position: 'relative'
                  }}
                >
                  <div className="feature-icon" style={{
                    background: 'var(--color-primary-500)', // Different shade or color
                    width: '56px', height: '56px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    [locale === 'ar' ? 'marginLeft' : 'marginRight']: '1.5rem',
                    fontSize: '1.75rem'
                  }}>
                    🕰️
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: 'white' }}>
                      {locale === 'ar' ? 'سجل النشاطات' : 'Aktivitätsverlauf'}
                    </h3>
                    <p style={{ color: 'var(--color-neutral-400)', margin: 0, fontSize: '0.95rem' }}>
                      {locale === 'ar'
                        ? 'راجع جميع النماذج والمستندات التي قمت بمعالجتها'
                        : 'Sehen Sie sich alle Ihre verarbeiteten Formulare und Dokumente an'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Active Feature View */
              <div className="feature-container animate-slide-up">
                {selectedFeature === 'form' && (
                  <FormFiller
                    user={user}
                    userCredits={userCredits}
                    setUserCredits={setUserCredits}
                    onAuthRequired={() => setShowAuthModal(true)}
                    onBuyCredits={() => setShowCreditsModal(true)}
                    onBack={() => setSelectedFeature(null)}
                  />
                )}

                {selectedFeature === 'explain' && (
                  <DocumentExplainer onBack={() => setSelectedFeature(null)} />
                )}

                {selectedFeature === 'cv' && (
                  <CVBuilder
                    onBack={() => setSelectedFeature(null)}
                    user={user}
                    userCredits={userCredits}
                    setUserCredits={setUserCredits}
                    onAuthRequired={() => setShowAuthModal(true)}
                    onBuyCredits={() => setShowCreditsModal(true)}
                  />
                )}

                {selectedFeature === 'pdf-edit' && (
                  <PdfEditor onBack={() => setSelectedFeature(null)} />
                )}

                {selectedFeature === 'image-pdf' && (
                  <ImageToPdf onBack={() => setSelectedFeature(null)} />
                )}

                {selectedFeature === 'history' && (
                  <HistoryView onBack={() => setSelectedFeature(null)} />
                )}
              </div>
            )}
          </div>
        )}
      </main>



      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        locale={locale}
      />

      <CreditsModal
        isOpen={showCreditsModal}
        onClose={() => setShowCreditsModal(false)}
        locale={locale}
        isLoggedIn={!!user}
        onLoginRequired={() => {
          setShowCreditsModal(false);
          setShowAuthModal(true);
        }}
      />

      {showProfileModal && user && (
        <ProfileModal
          user={user}
          locale={locale}
          onClose={() => setShowProfileModal(false)}
          onUpdate={(updatedUser) => setUser(updatedUser)}
        />
      )}
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="flex-center" style={{ minHeight: '100vh' }}><div className="loading-spinner" /></div>}>
      <HomePageContent />
    </Suspense>
  );
}
