'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { t } from '@/lib/translations';
import StepsIndicator from '@/components/StepsIndicator';
import UploadZone from '@/components/UploadZone';
import QuestionsForm from '@/components/QuestionsForm';
import ResultPreview from '@/components/ResultPreview';
import PositionAdjuster from '@/components/PositionAdjuster';
import DirectFormEditor from '@/components/DirectFormEditor';
import type { FormField, FormResult } from '@/types';
import type { User } from '@/types/auth';

const CREDIT_COST = 1;

interface FormFillerProps {
    user: User | null;
    userCredits: number;
    setUserCredits: (credits: number) => void;
    onAuthRequired: () => void;
    onBuyCredits: () => void;
    onBack?: () => void;
}

export default function FormFiller({
    user,
    userCredits,
    setUserCredits,
    onAuthRequired,
    onBuyCredits,
    onBack
}: FormFillerProps) {
    const searchParams = useSearchParams();
    const { locale, deductCredits, step, setStep } = useApp();

    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [fields, setFields] = useState<FormField[]>([]);
    const [result, setResult] = useState<FormResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPositionAdjuster, setShowPositionAdjuster] = useState(false);
    const [useDirectEditor, setUseDirectEditor] = useState(true);

    // Handle image selection
    const handleImageSelected = (_file: File, base64: string) => {
        setImageBase64(base64);
        setError(null);
    };

    const handleImageRemoved = () => {
        setImageBase64(null);
        setFields([]);
        setStep('upload');
    };

    const handleAnalyze = async () => {
        if (!imageBase64) return;

        if (userCredits < CREDIT_COST) {
            setError(t(locale, 'credits.insufficient'));
            onBuyCredits();
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64 }),
            });

            const data = await res.json();

            if (!data.success || !data.fields?.length) {
                setError(t(locale, 'errors.noQuestions'));
                return;
            }

            setFields(data.fields);
            setStep('questions');
        } catch {
            setError(t(locale, 'errors.analyze'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnswersSubmit = async (answers: Record<string, string>) => {
        setIsLoading(true);
        setError(null);

        try {
            const creditRes = await fetch('/api/credits/deduct', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: CREDIT_COST }),
            });

            const creditData = await creditRes.json();

            if (!creditData.success) {
                setError(creditData.error || t(locale, 'credits.insufficient'));
                return;
            }

            setUserCredits(creditData.credits);

            const answersArray = fields.map(field => ({
                fieldId: field.id,
                germanQuestion: field.germanQuestion,
                arabicAnswer: answers[field.id] || '',
            }));

            const res = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers: answersArray }),
            });

            const data = await res.json();

            if (!data.success) {
                setError(t(locale, 'errors.submit'));
                return;
            }

            const filledFields = fields.map(field => {
                const translation = data.translations?.find((tr: { fieldId: string }) =>
                    tr.fieldId === field.id ||
                    tr.fieldId?.toLowerCase() === field.id?.toLowerCase()
                );

                const germanAnswer = translation?.germanAnswer || '';

                return {
                    id: field.id,
                    germanQuestion: field.germanQuestion,
                    germanAnswer: germanAnswer || answers[field.id] || '',
                    position: field.position,
                    prefilled: false,
                    existingValue: null,
                };
            });

            setResult({
                fields: filledFields,
                generatedAt: new Date().toISOString(),
                creditsUsed: CREDIT_COST,
                originalImage: imageBase64 || undefined,
            });
            setStep('result');
        } catch {
            setError(t(locale, 'errors.submit'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewForm = () => {
        setImageBase64(null);
        setFields([]);
        setResult(null);
        setStep('upload');
        setError(null);
    };

    const handlePositionsUpdate = (updatedFields: { id: string; germanQuestion: string; position: { x: number; y: number; width: number; height: number } }[]) => {
        setFields(prevFields => prevFields.map(field => {
            const updated = updatedFields.find(f => f.id === field.id);
            if (updated) {
                return {
                    ...field,
                    position: updated.position,
                };
            }
            return field;
        }));

        if (result) {
            setResult(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    fields: prev.fields.map(field => {
                        const updated = updatedFields.find(f => f.id === field.id);
                        if (updated) {
                            return {
                                ...field,
                                position: updated.position,
                            };
                        }
                        return field;
                    }),
                };
            });
        }
    };

    interface TextBox {
        id: string;
        text: string;
        x: number;
        y: number;
        width?: number;
        height?: number;
        fontSize: number;
        germanQuestion?: string;
        arabicQuestion?: string;
        isTranslated?: boolean;
    }

    const handleDirectEditorComplete = async (textBoxes: TextBox[]) => {
        setIsLoading(true);
        setError(null);

        try {
            const answersToTranslate = textBoxes
                .filter(box => !box.isTranslated)
                .map(box => ({
                    fieldId: box.id,
                    arabicAnswer: box.text,
                }));

            let translations: any[] = [];

            if (answersToTranslate.length > 0) {
                const res = await fetch('/api/translate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ answers: answersToTranslate }),
                });

                const data = await res.json();

                if (!data.success) {
                    setError(t(locale, 'errors.submit'));
                    return;
                }
                translations = data.translations || [];
            }

            const filledFields = textBoxes.map(box => {
                const translation = translations.find((tr: { fieldId: string }) =>
                    tr.fieldId === box.id ||
                    tr.fieldId?.toLowerCase() === box.id?.toLowerCase()
                );

                const germanAnswer = translation?.germanAnswer || box.text;

                return {
                    id: box.id,
                    germanQuestion: box.germanQuestion || 'Freitext',
                    germanAnswer: germanAnswer,
                    position: {
                        x: box.x,
                        y: box.y,
                        width: box.width || 30,
                        height: box.height || 4,
                    },
                    prefilled: false,
                    existingValue: null,
                };
            });

            const creditRes = await fetch('/api/credits/deduct', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: CREDIT_COST }),
            });

            if (creditRes.ok) {
                const creditData = await creditRes.json();
                if (creditData.success) {
                    setUserCredits(creditData.remainingCredits);
                    deductCredits(CREDIT_COST);
                }
            }

            setResult({
                fields: filledFields,
                generatedAt: new Date().toISOString(),
                creditsUsed: CREDIT_COST,
                originalImage: imageBase64 || undefined,
            });
            setStep('result');
        } catch {
            setError(t(locale, 'errors.submit'));
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        onAuthRequired();
        return null;
    }

    return (
        <>
            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                {onBack && (
                    <button
                        onClick={onBack}
                        className="btn btn-secondary"
                        style={{ marginRight: '1rem', padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                    >
                        ← {locale === 'ar' ? 'الرجوع' : 'Zurück'}
                    </button>
                )}
            </div>

            <StepsIndicator currentStep={step} locale={locale} />

            <div className="main-content">
                {error && (
                    <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
                        {error}
                    </div>
                )}

                {step === 'upload' && (
                    <>
                        <UploadZone
                            onImageSelected={handleImageSelected}
                            onImageRemoved={handleImageRemoved}
                            currentImage={imageBase64}
                            isLoading={isLoading}
                            locale={locale}
                        />
                        {imageBase64 && (
                            <button
                                className="btn btn-primary btn-lg"
                                style={{ width: '100%', marginTop: '1.5rem' }}
                                onClick={handleAnalyze}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="loading-spinner" style={{ width: 20, height: 20 }} />
                                        {t(locale, 'upload.analyzing')}
                                    </>
                                ) : (
                                    t(locale, 'upload.analyze')
                                )}
                            </button>
                        )}
                    </>
                )}

                {step === 'questions' && fields.length > 0 && (
                    <>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 'var(--spacing-md)',
                            padding: 'var(--spacing-sm)',
                            background: 'var(--glass-bg)',
                            borderRadius: 'var(--radius-md)',
                            flexWrap: 'wrap',
                            gap: 'var(--spacing-sm)',
                        }}>
                            <span style={{ color: 'var(--color-neutral-300)', fontSize: '0.875rem' }}>
                                {locale === 'ar' ? 'خيارات التحرير:' : 'Bearbeitungsoptionen:'}
                            </span>

                            <div style={{ display: 'flex', gap: 'var(--spacing-xs)', flexWrap: 'wrap' }}>
                                {/* Position Adjuster Button */}
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setShowPositionAdjuster(true)}
                                    style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    {locale === 'ar' ? 'تعديل المواقع' : 'Positionen anpassen'}
                                </button>

                                <div style={{ width: '1px', background: 'var(--color-neutral-700)', margin: '0 4px' }}></div>

                                <button
                                    className={`btn ${useDirectEditor ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setUseDirectEditor(true)}
                                    style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
                                >
                                    {locale === 'ar' ? '✏️ كتابة مباشرة' : '✏️ Direkt schreiben'}
                                </button>
                                <button
                                    className={`btn ${!useDirectEditor ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setUseDirectEditor(false)}
                                    style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
                                >
                                    {locale === 'ar' ? '📝 نموذج الأسئلة' : '📝 Fragenformular'}
                                </button>
                            </div>
                        </div>

                        {useDirectEditor && imageBase64 && (
                            <DirectFormEditor
                                imageBase64={imageBase64}
                                fields={fields}
                                onComplete={handleDirectEditorComplete}
                                locale={locale}
                            />
                        )}

                        {!useDirectEditor && (
                            <QuestionsForm
                                fields={fields}
                                onSubmit={handleAnswersSubmit}
                                isLoading={isLoading}
                                locale={locale}
                                imageBase64={imageBase64}
                            />
                        )}

                        {isLoading && (
                            <div style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0,0,0,0.7)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 1000,
                            }}>
                                <div style={{ textAlign: 'center', color: 'white' }}>
                                    <div className="loading-spinner" style={{ width: 40, height: 40, margin: '0 auto 1rem' }} />
                                    <p>{locale === 'ar' ? 'جاري الترجمة والمعالجة...' : 'Übersetzen und verarbeiten...'}</p>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {step === 'result' && result && (
                    <ResultPreview
                        result={result}
                        onNewForm={handleNewForm}
                        locale={locale}
                        onAdjustPositions={() => setShowPositionAdjuster(true)}
                        imageBase64={imageBase64}
                    />
                )}
            </div>

            {showPositionAdjuster && imageBase64 && fields.length > 0 && (
                <PositionAdjuster
                    imageBase64={imageBase64}
                    fields={fields
                        .filter(f => f.position)
                        .map(f => {
                            // Try to find matching answer in result if available
                            const resultField = result?.fields.find(rf => rf.id === f.id);
                            return {
                                id: f.id,
                                germanQuestion: f.germanQuestion,
                                position: f.position!,
                                germanAnswer: resultField?.germanAnswer
                            };
                        })}
                    onPositionsUpdate={handlePositionsUpdate}
                    onClose={() => setShowPositionAdjuster(false)}
                    locale={locale}
                />
            )}
        </>
    );
}
