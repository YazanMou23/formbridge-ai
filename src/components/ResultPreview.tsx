'use client';

import React, { useState, useEffect } from 'react';
import type { Locale, FormResult } from '@/types';
import { t } from '@/lib/translations';
import { generatePDF, generateTextFile } from '@/lib/pdfExport';
import { overlayFieldsOnImage, generateFilledFormPDF } from '@/lib/imageOverlay';

interface Props {
    result: FormResult;
    onNewForm: () => void;
    locale: Locale;
    onAdjustPositions?: () => void;  // Optional callback to open position adjuster
    imageBase64?: string | null;     // Original image for position adjustment
}

export default function ResultPreview({ result, onNewForm, locale, onAdjustPositions, imageBase64 }: Props) {
    const [copied, setCopied] = useState(false);
    const [generatingFilledForm, setGeneratingFilledForm] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [debugMode, setDebugMode] = useState(false);
    const [generatingPreview, setGeneratingPreview] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Generate preview when toggled
    useEffect(() => {
        if (showPreview && result.originalImage) {
            generatePreview();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showPreview, debugMode, result]);

    const generatePreview = async () => {
        if (!result.originalImage) return;

        setGeneratingPreview(true);
        try {
            const filledImageBase64 = await overlayFieldsOnImage({
                imageBase64: result.originalImage,
                fields: result.fields.map(field => ({
                    germanAnswer: field.germanAnswer,
                    position: field.position,
                    prefilled: field.prefilled,
                    existingValue: field.existingValue,
                })),
                fontSize: 14,
                fontColor: '#0000AA',  // Blue for preview
                debugMode: debugMode,  // Show field boundaries
                showBackground: debugMode,  // Show white background in debug mode
                skipPrefilled: !debugMode,  // Show pre-filled fields in debug mode
            });
            setPreviewImage(filledImageBase64);
        } catch (error) {
            console.error('Error generating preview:', error);
        } finally {
            setGeneratingPreview(false);
        }
    };

    const handleCopy = () => {
        const text = result.fields.map(f => `${f.germanQuestion}: ${f.germanAnswer}`).join('\n');
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadPDF = () => {
        generatePDF({
            title: 'Ausgefülltes Formular',
            subtitle: 'Generiert mit FormBridge AI',
            fields: result.fields,
            generatedAt: result.generatedAt,
        });
        setTimeout(() => setIsSuccess(true), 1500);
    };

    const handleDownloadTXT = () => {
        generateTextFile(result.fields);
        setTimeout(() => setIsSuccess(true), 1500);
    };

    const handleDownloadFilledForm = async () => {
        if (!result.originalImage) {
            console.error('No original image available');
            return;
        }

        setGeneratingFilledForm(true);

        try {
            // Overlay answers on the original image
            const filledImageBase64 = await overlayFieldsOnImage({
                imageBase64: result.originalImage,
                fields: result.fields.map(field => ({
                    germanAnswer: field.germanAnswer,
                    position: field.position,
                    prefilled: field.prefilled,
                    existingValue: field.existingValue,
                })),
                fontSize: 14,
                fontColor: '#000000',
                debugMode: false,  // No debug in final output
                skipPrefilled: false,  // Include pre-filled fields (overwrite them)
                showBackground: false, // Ensure no background for final export
            });

            // Generate PDF from the filled image
            await generateFilledFormPDF(filledImageBase64);
            setIsSuccess(true);
        } catch (error) {
            console.error('Error generating filled form:', error);
        } finally {
            setGeneratingFilledForm(false);
        }
    };

    // Check if we have position data for filled form export
    const hasPositionData = result.fields.some(f => f.position);
    const canDownloadFilledForm = result.originalImage && hasPositionData;

    if (isSuccess) {
        return (
            <div className="animate-fade-in" style={{ padding: '2rem' }}>
                <div className="glass-card" style={{
                    padding: '3rem',
                    textAlign: 'center',
                    maxWidth: '500px',
                    margin: '0 auto',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1.5rem'
                }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: 'rgba(34, 197, 94, 0.2)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#22c55e',
                        fontSize: '32px'
                    }}>
                        ✓
                    </div>

                    <h2 style={{ color: 'white', margin: 0 }}>
                        {locale === 'ar' ? 'تمت العملية بنجاح' : 'Vorgang erfolgreich'}
                    </h2>

                    <p style={{ color: 'var(--color-neutral-300)', margin: 0 }}>
                        {locale === 'ar'
                            ? 'تم تحميل النموذج الخاص بك بنجاح.'
                            : 'Ihr Formular wurde erfolgreich heruntergeladen.'}
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', width: '100%' }}>
                        <button
                            onClick={onNewForm}
                            className="btn btn-primary"
                            style={{ flex: 1 }}
                        >
                            {locale === 'ar' ? 'نموذج جديد' : 'Neues Formular'}
                        </button>
                        <button
                            onClick={() => setIsSuccess(false)}
                            className="btn btn-secondary"
                            style={{ flex: 1 }}
                        >
                            {locale === 'ar' ? 'عرض النتائج' : 'Ergebnisse anzeigen'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="result-preview animate-slide-up">
            <div className="result-preview__header">
                <h2 className="result-preview__title">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t(locale, 'result.title')}
                </h2>
                <p style={{ color: 'var(--color-neutral-400)', fontSize: '0.875rem' }}>
                    {t(locale, 'result.subtitle')}
                </p>
            </div>

            {/* Preview Section */}
            {canDownloadFilledForm && (
                <div className="result-preview__visual" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 'var(--spacing-md)',
                        flexWrap: 'wrap',
                        gap: 'var(--spacing-sm)'
                    }}>
                        <button
                            className="btn btn-secondary"
                            onClick={() => setShowPreview(!showPreview)}
                            style={{ fontSize: '0.875rem' }}
                        >
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {showPreview
                                ? (locale === 'ar' ? 'إخفاء المعاينة' : 'Vorschau ausblenden')
                                : (locale === 'ar' ? 'معاينة النتيجة' : 'Vorschau anzeigen')
                            }
                        </button>

                        {showPreview && (
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-sm)',
                                fontSize: '0.8125rem',
                                color: 'var(--color-neutral-400)',
                                cursor: 'pointer'
                            }}>
                                <input
                                    type="checkbox"
                                    checked={debugMode}
                                    onChange={(e) => setDebugMode(e.target.checked)}
                                    style={{ cursor: 'pointer' }}
                                />
                                {locale === 'ar' ? 'إظهار حدود الحقول' : 'Feldgrenzen anzeigen'}
                            </label>
                        )}
                    </div>

                    {showPreview && (
                        <div style={{
                            position: 'relative',
                            background: 'rgba(0, 0, 0, 0.2)',
                            borderRadius: 'var(--radius-lg)',
                            padding: 'var(--spacing-md)',
                            overflow: 'auto',
                            maxHeight: '500px'
                        }}>
                            {generatingPreview ? (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minHeight: '200px'
                                }}>
                                    <div className="loading-spinner" />
                                </div>
                            ) : previewImage ? (
                                <img
                                    src={previewImage}
                                    alt="Preview"
                                    style={{
                                        maxWidth: '100%',
                                        height: 'auto',
                                        borderRadius: 'var(--radius-md)',
                                        boxShadow: 'var(--shadow-lg)'
                                    }}
                                />
                            ) : null}

                            {debugMode && previewImage && (
                                <p style={{
                                    marginTop: 'var(--spacing-sm)',
                                    fontSize: '0.75rem',
                                    color: 'var(--color-neutral-500)',
                                    textAlign: 'center'
                                }}>
                                    {locale === 'ar'
                                        ? 'المستطيلات الحمراء تُظهر مواقع الحقول المكتشفة. النص الأزرق يُظهر إجاباتك.'
                                        : 'Rote Rechtecke zeigen erkannte Feldpositionen. Blauer Text zeigt Ihre Antworten.'
                                    }
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}

            <div className="result-preview__fields">
                {result.fields.map((field, index) => (
                    <div
                        key={index}
                        className="result-field"
                        title={field.position
                            ? `Position: x=${field.position.x.toFixed(1)}%, y=${field.position.y.toFixed(1)}%, w=${field.position.width.toFixed(1)}%, h=${field.position.height.toFixed(1)}%`
                            : 'No position data'
                        }
                    >
                        <span className="result-field__label">
                            <span style={{
                                fontSize: '0.625rem',
                                color: 'var(--color-neutral-500)',
                                marginRight: 'var(--spacing-xs)'
                            }}>
                                #{index + 1}
                            </span>
                            {field.germanQuestion}
                        </span>
                        <span className="result-field__value">{field.germanAnswer}</span>
                        {field.position && (
                            <span style={{
                                fontSize: '0.625rem',
                                color: 'var(--color-neutral-600)',
                                marginTop: 'var(--spacing-xs)'
                            }}>
                                📍 x:{field.position.x.toFixed(0)}% y:{field.position.y.toFixed(0)}%
                                | {field.position.width.toFixed(0)}×{field.position.height.toFixed(0)}%
                            </span>
                        )}
                    </div>
                ))}
            </div>

            <div className="result-actions">
                <div className="result-actions__download">
                    {/* Primary action: Download Filled Form (if available) */}
                    {canDownloadFilledForm && (
                        <button
                            className="btn btn-primary btn-filled-form"
                            onClick={handleDownloadFilledForm}
                            disabled={generatingFilledForm}
                            title={t(locale, 'result.downloadFilledFormTooltip')}
                        >
                            {generatingFilledForm ? (
                                <>
                                    <span className="loading-spinner" style={{ width: 18, height: 18 }} />
                                    {t(locale, 'result.generatingImage')}
                                </>
                            ) : (
                                <>
                                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {t(locale, 'result.downloadFilledForm')}
                                </>
                            )}
                        </button>
                    )}

                    <button className="btn btn-primary" onClick={handleDownloadPDF}>
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {t(locale, 'result.downloadPDF')}
                    </button>
                    <button className="btn btn-secondary" onClick={handleDownloadTXT}>
                        {t(locale, 'result.downloadTXT')}
                    </button>
                </div>
                <div className="result-actions__other">
                    {/* Adjust Positions Button */}
                    {onAdjustPositions && imageBase64 && hasPositionData && (
                        <button
                            className="btn btn-secondary"
                            onClick={onAdjustPositions}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-xs)',
                                borderColor: 'var(--color-warning)',
                                color: 'var(--color-warning)'
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            {locale === 'ar' ? 'تعديل مواقع الحقول' : 'Positionen anpassen'}
                        </button>
                    )}
                    <button className="btn btn-secondary" onClick={handleCopy}>
                        {copied ? t(locale, 'result.copied') : t(locale, 'result.copy')}
                    </button>
                    <button className="btn btn-secondary" onClick={onNewForm}>
                        {t(locale, 'result.newForm')}
                    </button>
                </div>
            </div>
        </div>
    );
}

