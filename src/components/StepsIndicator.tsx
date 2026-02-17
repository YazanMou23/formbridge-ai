'use client';

import React from 'react';
import type { Locale, AppStep } from '@/types';
import { t } from '@/lib/translations';

interface Props {
    currentStep: AppStep;
    locale: Locale;
}

const STEPS: AppStep[] = ['upload', 'questions', 'result'];

export default function StepsIndicator({ currentStep, locale }: Props) {
    const currentIndex = STEPS.indexOf(currentStep);

    return (
        <div className="steps-indicator">
            {STEPS.map((step, index) => (
                <React.Fragment key={step}>
                    <div className={`step-item ${index === currentIndex ? 'active' : ''} ${index < currentIndex ? 'completed' : ''}`}>
                        <span className="step-item__number">
                            {index < currentIndex ? '✓' : index + 1}
                        </span>
                        <span className="step-item__label">
                            {step === 'upload' && t(locale, 'steps.upload')}
                            {step === 'questions' && t(locale, 'steps.answer')}
                            {step === 'result' && t(locale, 'steps.download')}
                        </span>
                    </div>
                    {index < STEPS.length - 1 && (
                        <div className={`step-connector ${index < currentIndex ? 'completed' : ''}`} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}
