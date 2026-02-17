'use client';

import React, { useState, useEffect } from 'react';
import type { Locale, FormField } from '@/types';
import { t } from '@/lib/translations';

interface Props {
    fields: FormField[];
    onSubmit: (answers: Record<string, string>) => void;
    isLoading: boolean;
    locale: Locale;
    imageBase64?: string | null;
}

export default function QuestionsForm({ fields, onSubmit, isLoading, locale, imageBase64 }: Props) {
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [errors, setErrors] = useState<Record<string, boolean>>({});

    // Initialize answers with existing values for pre-filled fields
    useEffect(() => {
        const initialAnswers: Record<string, string> = {};
        fields.forEach(field => {
            if (field.prefilled && field.existingValue) {
                // For pre-filled fields, we might want to show existing value
                // but let user override with their own answer
                initialAnswers[field.id] = '';
            }
        });
        setAnswers(prev => ({ ...prev, ...initialAnswers }));
    }, [fields]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields (skip pre-filled fields that user didn't change)
        const newErrors: Record<string, boolean> = {};
        fields.forEach(field => {
            // Skip validation for pre-filled fields
            if (field.prefilled && field.existingValue) {
                return;
            }
            if (field.required && !answers[field.id]?.trim()) {
                newErrors[field.id] = true;
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // For pre-filled fields without user input, use existing value
        const finalAnswers = { ...answers };
        fields.forEach(field => {
            if (field.prefilled && field.existingValue && !finalAnswers[field.id]?.trim()) {
                finalAnswers[field.id] = field.existingValue;
            }
        });

        onSubmit(finalAnswers);
    };

    const handleChange = (fieldId: string, value: string) => {
        setAnswers(prev => ({ ...prev, [fieldId]: value }));
        if (errors[fieldId]) {
            setErrors(prev => ({ ...prev, [fieldId]: false }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="questions-container animate-slide-up">
            <div className="glass-card">
                <h2 style={{ marginBottom: '0.5rem' }}>{t(locale, 'questions.title')}</h2>
                <p style={{ marginBottom: '1.5rem', color: 'var(--color-neutral-400)' }}>
                    {t(locale, 'questions.subtitle')}
                </p>
            </div>

            {fields.map((field, index) => (
                <div
                    key={field.id}
                    className="question-card"
                    style={field.prefilled ? {
                        borderColor: 'var(--color-success)',
                        borderWidth: '2px'
                    } : undefined}
                >
                    <div className="question-card__header">
                        <span className="question-card__number">{index + 1}</span>
                        <div style={{ flex: 1 }}>
                            <p className="question-card__german">
                                {t(locale, 'questions.germanLabel')} {field.germanQuestion}
                                {field.prefilled && (
                                    <span style={{
                                        marginRight: '0.5rem',
                                        marginLeft: '0.5rem',
                                        fontSize: '0.75rem',
                                        color: 'var(--color-success)',
                                        background: 'rgba(34, 197, 94, 0.1)',
                                        padding: '0.125rem 0.5rem',
                                        borderRadius: '0.25rem'
                                    }}>
                                        {locale === 'ar' ? '✓ معبأ مسبقاً' : '✓ Bereits ausgefüllt'}
                                    </span>
                                )}
                            </p>
                            <p className="question-card__arabic">{field.arabicQuestion}</p>
                        </div>
                    </div>

                    {/* Show existing value for pre-filled fields */}
                    {field.prefilled && field.existingValue && (
                        <div style={{
                            background: 'rgba(34, 197, 94, 0.1)',
                            border: '1px solid var(--color-success)',
                            borderRadius: 'var(--radius-md)',
                            padding: 'var(--spacing-sm) var(--spacing-md)',
                            marginBottom: 'var(--spacing-sm)',
                            fontSize: '0.875rem'
                        }}>
                            <span style={{ color: 'var(--color-neutral-400)', marginLeft: '0.5rem' }}>
                                {locale === 'ar' ? 'القيمة الحالية:' : 'Aktueller Wert:'}
                            </span>
                            <span style={{ color: 'var(--color-success)', fontWeight: 500 }}>
                                {field.existingValue}
                            </span>
                        </div>
                    )}

                    {field.fieldType === 'textarea' ? (
                        <textarea
                            className={`input-field textarea-field ${errors[field.id] ? 'error' : ''}`}
                            value={answers[field.id] || ''}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            placeholder={
                                field.prefilled
                                    ? (locale === 'ar' ? 'اترك فارغاً لاستخدام القيمة الحالية' : 'Leer lassen für aktuellen Wert')
                                    : t(locale, 'questions.placeholder')
                            }
                            dir="rtl"
                        />
                    ) : (
                        <input
                            type={field.fieldType === 'date' ? 'date' : field.fieldType === 'email' ? 'email' : 'text'}
                            className={`input-field ${errors[field.id] ? 'error' : ''}`}
                            value={answers[field.id] || ''}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            placeholder={
                                field.prefilled
                                    ? (locale === 'ar' ? 'اترك فارغاً لاستخدام القيمة الحالية' : 'Leer lassen für aktuellen Wert')
                                    : t(locale, 'questions.placeholder')
                            }
                            dir="rtl"
                        />
                    )}

                    {errors[field.id] && (
                        <p style={{ color: 'var(--color-error)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                            {t(locale, 'questions.requiredField')}
                        </p>
                    )}
                </div>
            ))}

            <button type="submit" className="btn btn-primary btn-lg" disabled={isLoading} style={{ width: '100%' }}>
                {isLoading ? t(locale, 'questions.submitting') : t(locale, 'questions.submit')}
            </button>

            {imageBase64 && (
                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <h3 style={{ color: 'var(--color-neutral-300)', marginBottom: '1rem' }}>
                        {locale === 'ar' ? 'نموذج الوثيقة (للمرجعية)' : 'Dokumentvorschau (Referenz)'}
                    </h3>
                    <img
                        src={imageBase64}
                        alt="Form Reference"
                        style={{
                            maxWidth: '100%',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--glass-border)'
                        }}
                    />
                </div>
            )}
        </form>
    );
}
