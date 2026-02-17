'use client';

import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import DirectFormEditor, { type TextBox } from './DirectFormEditor';
import { handleFileSelection } from '@/lib/pdfUtils';
import { useApp } from '@/context/AppContext';

interface Props {
    onBack: () => void;
}

export default function PdfEditor({ onBack }: Props) {
    const { locale } = useApp();
    const [file, setFile] = useState<File | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false); // New state

    const handleReset = () => {
        setFile(null);
        setImageBase64(null);
        setIsSuccess(false);
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setIsLoading(true);
            try {
                const selectedFile = e.target.files[0];
                const { formattedFile, base64 } = await handleFileSelection(selectedFile).then(res => ({ formattedFile: res.file, base64: res.base64 }));
                setFile(formattedFile || selectedFile);
                setImageBase64(base64);
            } catch (error) {
                console.error(error);
                alert('Error loading file');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleComplete = async (textBoxes: TextBox[]) => {
        if (!imageBase64) return;
        setIsLoading(true);

        try {
            // Create PDF
            // Load image to get dimensions
            const img = new Image();
            img.src = imageBase64;
            await new Promise((resolve) => { img.onload = resolve; });

            const orientation = img.width > img.height ? 'landscape' : 'portrait';
            const pdf = new jsPDF({
                orientation,
                unit: 'pt',
                format: [img.width, img.height] // Use pixel dimensions as points for simplicity 1:1 mapping
            });

            // Add background
            pdf.addImage(imageBase64, 'PNG', 0, 0, img.width, img.height);

            // Add fields
            textBoxes.forEach(box => {
                const x = (box.x / 100) * img.width;
                const y = (box.y / 100) * img.height;

                if (box.type === 'signature' && box.imageUrl) {
                    // Signature Image
                    // box.width is percentage of image width
                    // box.scale is also available from my recent edit if I used it, but DirectFormEditor returns width/height in percentages on finalize? 
                    // Wait, handleFinalize in DirectFormEditor calculates width/height based on DOM rect.
                    // So box.width and box.height are percentages of the container image.

                    const w = (box.width! / 100) * img.width;
                    const h = (box.height! / 100) * img.height;

                    pdf.addImage(box.imageUrl, 'PNG', x, y, w, h);
                } else {
                    // Text
                    // fontSize in px needs conversion to pt?
                    // DirectFormEditor uses px. jsPDF uses pt. 1px = 0.75pt approx.
                    // But here our PDF format is [img.width, img.height] in points.
                    // So 1 unit = 1 point.
                    // If image is 1000px wide, PDF is 1000pt wide.
                    // Then fontSize 14px should be rendered as 14 units?
                    // Actually, if I match the coordinate system, I can use px value directly as pt value if 1px screen = 1pt pdf.
                    // Let's try direct mapping.

                    pdf.setFontSize(box.fontSize);
                    const text = box.text || '';

                    // RTL support for PDF is tricky. jsPDF has basic support?
                    // If text is Arabic, we might need to reverse it or use a plugin.
                    // For now, basic text.
                    pdf.setTextColor(0, 0, 0);
                    // pdf.text supports 'align' but x,y are start coordinates.

                    // Adjust for padding and baseline
                    const xOffset = 6;
                    const yOffset = 4;

                    // Handle text wrapping
                    // box.width is available from DirectFormEditor
                    if (box.width) {
                        const maxWidth = ((box.width / 100) * img.width) - (xOffset * 2); // padding
                        if (maxWidth > 0) {
                            const lines = pdf.splitTextToSize(text, maxWidth);
                            pdf.text(lines, x + xOffset, y + box.fontSize + yOffset);
                        } else {
                            pdf.text(text, x + xOffset, y + box.fontSize + yOffset);
                        }
                    } else {
                        pdf.text(text, x + xOffset, y + box.fontSize + yOffset);
                    }
                }
            });

            pdf.save('edited-document.pdf');
            setIsSuccess(true);

        } catch (error) {
            console.error('PDF Generation failed', error);
            alert('Failed to generate PDF');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && !imageBase64) {
        return (
            <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column', gap: '1rem' }}>
                <div className="loading-spinner" />
                <p style={{ color: 'white' }}>{locale === 'ar' ? 'جاري المعالجة...' : 'Wird verarbeitet...'}</p>
            </div>
        );
    }

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
                            ? 'تم تحميل ملف PDF الخاص بك بنجاح.'
                            : 'Ihr PDF wurde erfolgreich heruntergeladen.'}
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', width: '100%' }}>
                        <button
                            onClick={handleReset}
                            className="btn btn-primary"
                            style={{ flex: 1 }}
                        >
                            {locale === 'ar' ? 'مستند جديد' : 'Neues Dokument'}
                        </button>
                        <button
                            onClick={onBack}
                            className="btn btn-secondary"
                            style={{ flex: 1 }}
                        >
                            {locale === 'ar' ? 'القائمة الرئيسية' : 'Hauptmenü'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (imageBase64) {
        return (
            <div className="animate-fade-in">
                <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button onClick={onBack} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }}>
                            ← {locale === 'ar' ? 'الرجوع' : 'Zurück'}
                        </button>
                        <h2 style={{ color: 'white', margin: 0 }}>
                            {locale === 'ar' ? 'تحرير المستند' : 'Dokument bearbeiten'}
                        </h2>
                    </div>
                </div>

                <DirectFormEditor
                    imageBase64={imageBase64}
                    fields={[]} // No AI detected fields, pure manual edit
                    onComplete={handleComplete}
                    locale={locale}
                />
            </div>
        );
    }

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
                    {locale === 'ar' ? 'محرر PDF & التوقيع' : 'PDF Editor & Unterschrift'}
                </h2>
            </div>

            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                <div
                    className="upload-zone"
                    style={{
                        border: '2px dashed var(--color-neutral-600)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '3rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        background: 'rgba(255,255,255,0.02)'
                    }}
                >
                    <input
                        type="file"
                        accept="application/pdf,image/*"
                        onChange={handleUpload}
                        style={{ display: 'none' }}
                        id="pdf-upload"
                    />
                    <label htmlFor="pdf-upload" style={{ cursor: 'pointer', display: 'block', width: '100%', height: '100%' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✍️</div>
                        <h3 style={{ color: 'var(--color-neutral-200)', marginBottom: '0.5rem' }}>
                            {locale === 'ar' ? 'اضغط لرفع ملف PDF أو صورة' : 'PDF oder Bild hochladen'}
                        </h3>
                        <p style={{ color: 'var(--color-neutral-400)' }}>
                            PDF, JPG, PNG (Max 10MB)
                        </p>
                    </label>
                </div>
            </div>
        </div>
    );
}
