'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import UploadZone from '@/components/UploadZone';
import { t } from '@/lib/translations';

interface Props {
    onBack: () => void;
}

export default function DocumentExplainer({ onBack }: Props) {
    const { locale } = useApp();
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [explanation, setExplanation] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleImageSelected = (_file: File, base64: string) => {
        setImageBase64(base64);
        setError(null);
        setExplanation(null);
    };

    const handleExplain = async () => {
        if (!imageBase64) return;
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/explain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64: imageBase64 }), // Must include data:image/png;base64,... prefix
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed');
            }

            setExplanation(data.explanation);

        } catch (err: any) {
            console.error(err);
            setError(locale === 'ar' ? 'فشل تحليل المستند' : 'Fehler bei der Dokumentenanalyse');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="glass-card animate-scale-in">
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-neutral-300)',
                        cursor: 'pointer',
                        marginRight: '1rem',
                        fontSize: '1.2rem'
                    }}
                >
                    ←
                </button>
                <h2 className="text-xl font-bold text-white">
                    {locale === 'ar' ? 'شرح المستندات' : 'Dokumentenerklärung'}
                </h2>
            </div>

            {!explanation ? (
                <>
                    <p style={{ color: 'var(--color-neutral-300)', marginBottom: '1.5rem' }}>
                        {locale === 'ar'
                            ? 'قم برفع صورة أو ملف PDF وسيقوم النظام بشرح محتواه باللهجة السورية المبسطة.'
                            : 'Laden Sie ein Dokument hoch (Bild oder PDF), um eine Erklärung im syrischen Dialekt zu erhalten.'}
                    </p>

                    <UploadZone
                        onImageSelected={handleImageSelected}
                        onImageRemoved={() => setImageBase64(null)}
                        currentImage={imageBase64}
                        isLoading={isLoading}
                        locale={locale}
                        accept="image/*,application/pdf"
                    />

                    {imageBase64 && (
                        <button
                            className="btn btn-primary btn-lg"
                            style={{ width: '100%', marginTop: '1.5rem' }}
                            onClick={handleExplain}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="loading-spinner" style={{ width: 20, height: 20 }} />
                                    {locale === 'ar' ? 'جاري التحليل...' : 'Analysieren...'}
                                </>
                            ) : (
                                locale === 'ar' ? 'اشرح لي المستند' : 'Dokument erklären'
                            )}
                        </button>
                    )}

                    {error && <div className="alert alert-error" style={{ marginTop: '1rem' }}>{error}</div>}
                </>
            ) : (
                <div className="animate-fade-in">
                    <div style={{
                        background: 'rgba(0,0,0,0.3)',
                        padding: '1.5rem',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--color-neutral-700)',
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.8',
                        direction: 'rtl',
                        textAlign: 'right',
                        color: 'var(--color-neutral-100)',
                        maxHeight: '400px',
                        overflowY: 'auto'
                    }}>
                        <h3 style={{ color: 'var(--color-primary-400)', marginBottom: '1rem' }}>
                            📝 الشرح باللهجة السورية:
                        </h3>
                        {explanation}
                    </div>

                    <button
                        className="btn btn-secondary"
                        style={{ width: '100%', marginTop: '1.5rem' }}
                        onClick={() => {
                            setImageBase64(null);
                            setExplanation(null);
                        }}
                    >
                        {locale === 'ar' ? 'شرح مستند آخر' : 'Anderes Dokument erklären'}
                    </button>
                </div>
            )}
        </div>
    );
}
