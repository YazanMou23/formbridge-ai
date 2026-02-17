'use client';

import React, { useRef, useState, DragEvent, ChangeEvent, useEffect } from 'react';
import type { Locale } from '@/types';
import { t } from '@/lib/translations';
import { validateImage, fileToBase64 } from '@/lib/imageUtils';

interface Props {
    onImageSelected: (file: File, base64: string) => void;
    onImageRemoved: () => void;
    currentImage: string | null;
    isLoading: boolean;
    locale: Locale;
    accept?: string;
}

export default function UploadZone({
    onImageSelected,
    onImageRemoved,
    currentImage,
    isLoading,
    locale,
    accept = 'image/jpeg,image/jpg,image/png'
}: Props) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        setError(null);

        try {
            if (file.type === 'application/pdf') {
                // Set worker up front using standard string path to public CDN
                // This avoids complex bundling issues with Next.js/Webpack
                // We use the modern ESM build from cdnjs
                const pdfjs = await import('pdfjs-dist');
                pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
                const page = await pdf.getPage(1);

                const viewport = page.getViewport({ scale: 2.0 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');

                if (!context) throw new Error('Canvas context not available');

                canvas.width = viewport.width;
                canvas.height = viewport.height;

                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;

                const base64 = canvas.toDataURL('image/png');
                onImageSelected(file, base64);

            } else {
                const validation = validateImage(file);
                if (!validation.valid) {
                    setError(t(locale, `errors.${validation.error}`));
                    return;
                }

                const base64 = await fileToBase64(file);
                onImageSelected(file, base64);
            }
        } catch (err) {
            console.error(err);
            setError(t(locale, 'errors.upload'));
        }
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    return (
        <div className="glass-card animate-fade-in">
            <div
                className={`upload-zone ${isDragging ? 'dragging' : ''} ${currentImage ? 'has-image' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => !currentImage && inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    onChange={handleChange}
                    style={{ display: 'none' }}
                />

                {currentImage ? (
                    <>
                        <img src={currentImage} alt="Preview" className="upload-zone__preview" />
                        <button
                            className="btn btn-secondary btn-icon upload-zone__remove"
                            onClick={(e) => { e.stopPropagation(); onImageRemoved(); }}
                            disabled={isLoading}
                        >✕</button>
                    </>
                ) : (
                    <>
                        <svg className="upload-zone__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <div className="upload-zone__text">
                            <p className="upload-zone__title">{t(locale, 'upload.title')}</p>
                            <p className="upload-zone__subtitle">{t(locale, 'upload.subtitle')}</p>
                            <p className="upload-zone__subtitle">
                                {accept.includes('pdf') ? t(locale, 'upload.formatsWithPdf') : t(locale, 'upload.formats')}
                            </p>
                        </div>
                    </>
                )}
            </div>

            {error && <div className="alert alert-error" style={{ marginTop: '1rem' }}>{error}</div>}
        </div>
    );
}
