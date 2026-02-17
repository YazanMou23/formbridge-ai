'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import { jsPDF } from 'jspdf';
import { t } from '@/lib/translations';
import { useApp } from '@/context/AppContext';
import { validateImage } from '@/lib/imageUtils';

import 'react-image-crop/dist/ReactCrop.css';

interface Props {
    onBack: () => void;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
    )
}

export default function ImageToPdf({ onBack }: Props) {
    const { locale } = useApp();
    const [imgSrc, setImgSrc] = useState('');
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [rotation, setRotation] = useState(0); // For CSS visual only? No, we rotate data.
    const [isLoading, setIsLoading] = useState(false);

    const imgRef = useRef<HTMLImageElement>(null);
    const hiddenAnchorRef = useRef<HTMLAnchorElement>(null);
    const blobUrlRef = useRef('');

    const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setCrop(undefined); // Makes crop preview update between images.
            const file = e.target.files[0];
            const validation = validateImage(file);
            if (!validation.valid) {
                alert(validation.error);
                return;
            }
            const reader = new FileReader();
            reader.addEventListener('load', () =>
                setImgSrc(reader.result?.toString() || '')
            );
            reader.readAsDataURL(file);
        }
    };

    const handleRotate = (angle: number) => {
        if (!imgSrc) return;
        setIsLoading(true);
        // Create an image to rotate
        const image = new Image();
        image.src = imgSrc;
        image.onload = () => {
            const canvas = document.createElement('canvas');
            // Swap width/height for 90 degree rotations
            if (Math.abs(angle) === 90) {
                canvas.width = image.height;
                canvas.height = image.width;
            } else {
                canvas.width = image.width;
                canvas.height = image.height;
            }
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate((angle * Math.PI) / 180);
            ctx.drawImage(image, -image.width / 2, -image.height / 2);

            setImgSrc(canvas.toDataURL());
            setCrop(undefined);
            setIsLoading(false);
        };
    };

    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget;
        // Use full image as default crop or center?
        // Let's default to full image selected?
        // Or no selection.
        // centerAspectCrop(width, height, 16 / 9)
        const initCrop = centerAspectCrop(width, height, width / height);
        setCrop(initCrop);
    };

    const generatePdf = async () => {
        if (!imgSrc || !imgRef.current) return;
        setIsLoading(true);
        try {
            const canvas = document.createElement('canvas');
            const image = imgRef.current;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                throw new Error('No 2d context');
            }

            // If crop is active, use it. Else use full image.
            const scaleX = image.naturalWidth / image.width;
            const scaleY = image.naturalHeight / image.height;

            const pixelCrop = completedCrop ?? {
                x: 0,
                y: 0,
                width: image.width,
                height: image.height,
                unit: 'px'
            };

            const finalWidth = pixelCrop.width * scaleX;
            const finalHeight = pixelCrop.height * scaleY;
            const finalX = pixelCrop.x * scaleX;
            const finalY = pixelCrop.y * scaleY;

            canvas.width = finalWidth;
            canvas.height = finalHeight;

            ctx.drawImage(
                image,
                finalX,
                finalY,
                finalWidth,
                finalHeight,
                0,
                0,
                finalWidth,
                finalHeight,
            );

            const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.95);

            // Generate PDF
            // Determine orientation based on aspect ratio
            const orientation = finalWidth > finalHeight ? 'landscape' : 'portrait';
            const pdf = new jsPDF({
                orientation,
                unit: 'pt',
                format: [finalWidth * 0.75, finalHeight * 0.75] // Convert px to points approx
            });

            // Add image to PDF (fit to page)
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            pdf.addImage(croppedDataUrl, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('document.pdf');
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                <button
                    onClick={onBack}
                    className="btn btn-secondary"
                    style={{ marginRight: '1rem', padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                >
                    ← {locale === 'ar' ? 'الرجوع' : 'Zurück'}
                </button>
                <h2 style={{ color: 'white', margin: 0 }}>
                    {locale === 'ar' ? 'تحويل صورة إلى PDF' : 'Bild zu PDF'}
                </h2>
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
                {!imgSrc ? (
                    <div
                        className="upload-zone"
                        style={{
                            border: '2px dashed var(--color-neutral-600)',
                            borderRadius: 'var(--radius-lg)',
                            padding: '3rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            background: 'rgba(255,255,255,0.02)'
                        }}
                    >
                        <input
                            type="file"
                            accept="image/*"
                            onChange={onSelectFile}
                            style={{ display: 'none' }}
                            id="pdf-img-upload"
                        />
                        <label htmlFor="pdf-img-upload" style={{ cursor: 'pointer', display: 'block', width: '100%', height: '100%' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🖼️</div>
                            <h3 style={{ color: 'var(--color-neutral-200)', marginBottom: '0.5rem' }}>
                                {locale === 'ar' ? 'اضغط لرفع صورة' : 'Klicken zum Hochladen'}
                            </h3>
                            <p style={{ color: 'var(--color-neutral-400)' }}>
                                JPG, PNG (Max 10MB)
                            </p>
                        </label>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button className="btn btn-secondary" onClick={() => handleRotate(-90)} disabled={isLoading}>
                                ↺ {locale === 'ar' ? 'تدوير يسار' : 'Links drehen'}
                            </button>
                            <button className="btn btn-secondary" onClick={() => handleRotate(90)} disabled={isLoading}>
                                ↻ {locale === 'ar' ? 'تدوير يمين' : 'Rechts drehen'}
                            </button>
                            <button className="btn btn-secondary" onClick={() => setImgSrc('')}>
                                ✕ {locale === 'ar' ? 'إلغاء' : 'Entfernen'}
                            </button>
                        </div>

                        <div style={{ maxWidth: '100%', overflow: 'auto', background: '#000', borderRadius: '8px', display: 'flex', justifyContent: 'center' }}>
                            <ReactCrop
                                crop={crop}
                                onChange={(_, percentCrop) => setCrop(percentCrop)}
                                onComplete={(c) => setCompletedCrop(c)}
                                style={{ maxHeight: '70vh' }}
                            >
                                <img
                                    ref={imgRef}
                                    alt="Crop me"
                                    src={imgSrc}
                                    onLoad={onImageLoad}
                                    style={{ display: 'block', maxHeight: '70vh', maxWidth: '100%' }}
                                />
                            </ReactCrop>
                        </div>

                        <button
                            className="btn btn-primary btn-lg"
                            onClick={generatePdf}
                            disabled={isLoading}
                            style={{ width: '100%' }}
                        >
                            {isLoading ? (
                                <span className="loading-spinner" />
                            ) : (
                                locale === 'ar' ? '📄 إنشاء PDF' : '📄 PDF generieren'
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
