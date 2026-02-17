import React, { useState, useRef, useEffect } from 'react';
import type { FormField, Locale } from '@/types';
import SignatureCanvas from 'react-signature-canvas';

export interface TextBox {
    id: string;
    text: string;
    type?: 'text' | 'signature';
    imageUrl?: string;
    x: number;  // percentage
    y: number;  // percentage
    width?: number; // percentage
    height?: number; // percentage
    scale?: number; // for signature scaling
    fontSize: number;
    germanQuestion?: string;
    arabicQuestion?: string;
    isTranslated?: boolean;
}

interface Props {
    imageBase64: string;
    fields: FormField[];  // Detected fields with questions
    onComplete: (textBoxes: TextBox[]) => void;
    locale: Locale;
}

export default function DirectFormEditor({ imageBase64, fields, onComplete, locale }: Props) {
    const [textBoxes, setTextBoxes] = useState<TextBox[]>([]);
    const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [showInstructions, setShowInstructions] = useState(true); // Can keep or remove
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const imageRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const sigCanvasRef = useRef<SignatureCanvas>(null);
    // Removed sidebarAnswers as we edit directly in boxes
    const [isTranslating, setIsTranslating] = useState(false);

    // Initialize boxes from fields
    useEffect(() => {
        if (fields.length > 0 && textBoxes.length === 0) {
            const initialBoxes: TextBox[] = fields.map((field, index) => ({
                id: field.id,
                text: field.existingValue || '', // Pre-fill if exists
                type: 'text',
                x: field.position?.x || 10,
                y: field.position?.y || (10 + index * 5),
                width: field.position?.width,
                height: field.position?.height,
                fontSize: 14,
                germanQuestion: field.germanQuestion,
                arabicQuestion: field.arabicQuestion,
                isTranslated: false
            }));
            setTextBoxes(initialBoxes);
        }
    }, [fields]);

    // Helper to detect text direction
    const getDirection = (text: string) => {
        const arabicPattern = /[\u0600-\u06FF]/;
        return arabicPattern.test(text) ? 'rtl' : 'ltr';
    };

    // Handle dropping an answer onto the image
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const rect = imageRef.current?.getBoundingClientRect();
        if (!rect) return;

        const fieldId = e.dataTransfer.getData('fieldId');
        const text = e.dataTransfer.getData('text');

        if (!text) return;

        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        const field = fields.find(f => f.id === fieldId);

        const newBox: TextBox = {
            id: `box_${Date.now()}`,
            text: text,
            type: 'text',
            x: Math.max(0, Math.min(95, x)), // Keep within bounds
            y: Math.max(0, Math.min(95, y)),
            fontSize: 14,
            germanQuestion: field?.germanQuestion,
            arabicQuestion: field?.arabicQuestion,
            isTranslated: false
        };

        setTextBoxes(prev => [...prev, newBox]);
        setSelectedBoxId(newBox.id);
        setShowInstructions(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    // Handle clicking on the image to add a free text box
    const handleImageClick = (e: React.MouseEvent) => {
        if (isDragging) return;

        const rect = imageRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        const newBox: TextBox = {
            id: `box_${Date.now()}`,
            text: '',
            type: 'text',
            x,
            y,
            fontSize: 14,
        };
        setTextBoxes(prev => [...prev, newBox]);
        setSelectedBoxId(newBox.id);
        setShowInstructions(false);
    };

    // Handle dragging a text box (moving it on the image)
    const handleBoxStart = (e: React.MouseEvent | React.TouchEvent, boxId: string) => {
        e.stopPropagation();
        setSelectedBoxId(boxId);
        setIsDragging(true);
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        setDragStart({ x: clientX, y: clientY });
    };

    const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging || !selectedBoxId || !imageRef.current) return;

        // Prevent scrolling on mobile
        if ('touches' in e && e.cancelable) {
            e.preventDefault();
        }

        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

        const rect = imageRef.current.getBoundingClientRect();
        const deltaX = ((clientX - dragStart.x) / rect.width) * 100;
        const deltaY = ((clientY - dragStart.y) / rect.height) * 100;

        setTextBoxes(prev => prev.map(box => {
            if (box.id !== selectedBoxId) return box;
            return {
                ...box,
                x: box.x + deltaX, // Allow free movement without strict 0-100 bounds
                y: box.y + deltaY,
            };
        }));

        setDragStart({ x: clientX, y: clientY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Update text for a box
    const handleTextChange = (boxId: string, text: string) => {
        setTextBoxes(prev => prev.map(box =>
            box.id === boxId ? { ...box, text, isTranslated: false } : box
        ));
    };

    // Delete a text box
    const handleDeleteBox = (boxId: string) => {
        setTextBoxes(prev => prev.filter(box => box.id !== boxId));
        if (selectedBoxId === boxId) setSelectedBoxId(null);
    };

    // Handle font size change or image scale
    const handleFontSizeChange = (boxId: string, delta: number) => {
        setTextBoxes(prev => prev.map(box => {
            if (box.id !== boxId) return box;
            if (box.type === 'signature') {
                const currentScale = box.scale || 1;
                const newScale = Math.max(0.5, Math.min(3, currentScale + (delta * 0.1)));
                return { ...box, scale: newScale };
            }
            return { ...box, fontSize: Math.max(8, Math.min(32, box.fontSize + delta)) };
        }));
    };

    // Translate answers in place
    const handleTranslateInPlace = async () => {
        setIsTranslating(true);
        try {
            const boxesToTranslate = textBoxes.filter(b => b.text.trim() && !b.isTranslated && b.type !== 'signature');

            if (boxesToTranslate.length === 0) {
                setIsTranslating(false);
                return;
            }

            const answersToTranslate = boxesToTranslate.map(box => ({
                fieldId: box.id,
                arabicAnswer: box.text,
            }));

            const res = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers: answersToTranslate }),
            });

            const data = await res.json();

            if (data.success && data.translations) {
                setTextBoxes(prev => prev.map(box => {
                    const translation = data.translations.find((tr: any) => tr.fieldId === box.id);
                    if (translation) {
                        return {
                            ...box,
                            text: translation.germanAnswer,
                            isTranslated: true
                        };
                    }
                    return box;
                }));
            }
        } catch (error) {
            console.error('Translation failed', error);
        } finally {
            setIsTranslating(false);
        }
    };

    // Complete and send to parent (Finalize)
    const handleFinalize = () => {
        if (!imageRef.current) return;
        const imgRect = imageRef.current.getBoundingClientRect();

        // Calculate actual width/height for each box before sending
        const finalizedBoxes = textBoxes
            .filter(box => (box.type === 'signature' || box.text.trim()))
            .map(box => {
                const element = document.getElementById(box.id);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    return {
                        ...box,
                        width: (rect.width / imgRect.width) * 100,
                        height: (rect.height / imgRect.height) * 100
                    };
                }
                return box;
            });

        onComplete(finalizedBoxes);
    };

    // Signature Handling
    const handleSaveSignature = () => {
        if (sigCanvasRef.current) {
            const signatureData = sigCanvasRef.current.toDataURL(); // base64 png
            // Add signature box to center of screen (approx)
            const newBox: TextBox = {
                id: `sig_${Date.now()}`,
                text: 'Signature',
                type: 'signature',
                imageUrl: signatureData,
                x: 40,
                y: 40,
                fontSize: 14,
                scale: 1,
            };
            setTextBoxes(prev => [...prev, newBox]);
            setSelectedBoxId(newBox.id);
            setShowSignatureModal(false);
        }
    };



    const selectedBox = textBoxes.find(b => b.id === selectedBoxId);

    // Initial Answers State


    return (
        <div className="direct-editor-container" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-md)',
            height: 'calc(100vh - 150px)',
            minHeight: '600px',
        }}>
            {/* Top Toolbar */}
            <div style={{
                display: 'flex',
                gap: 'var(--spacing-sm)',
                padding: 'var(--spacing-sm)',
                background: 'var(--glass-bg)',
                borderRadius: 'var(--radius-md)',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={handleImageClick}
                        style={{ fontSize: '0.875rem' }}
                    >
                        <span>➕</span> {locale === 'ar' ? 'نص حر' : 'Text'}
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setShowSignatureModal(true)}
                        style={{ fontSize: '0.875rem' }}
                    >
                        <span>✍️</span> {locale === 'ar' ? 'توقيع' : 'Unterschrift'}
                    </button>
                    {selectedBox && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                            <button onClick={() => handleFontSizeChange(selectedBox.id, -2)} style={{ padding: '0 4px', cursor: 'pointer' }}>-</button>
                            <span style={{ fontSize: '0.8rem', color: 'white' }}>
                                {selectedBox.type === 'signature' ? (selectedBox.scale || 1).toFixed(1) + 'x' : selectedBox.fontSize + 'px'}
                            </span>
                            <button onClick={() => handleFontSizeChange(selectedBox.id, 2)} style={{ padding: '0 4px', cursor: 'pointer' }}>+</button>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={handleTranslateInPlace}
                        disabled={isTranslating}
                        style={{ fontSize: '0.875rem' }}
                    >
                        {isTranslating ? (
                            <span className="loading-spinner" style={{ width: 14, height: 14 }} />
                        ) : '🌍'} {locale === 'ar' ? 'ترجمة' : 'Übersetzen'}
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleFinalize}
                        style={{ fontSize: '0.875rem' }}
                    >
                        {locale === 'ar' ? '✅ إنهاء' : '✅ Fertig'}
                    </button>
                </div>
            </div>



            {/* Main Form Image Area */}
            <div
                ref={containerRef}
                className="image-container"
                style={{
                    flex: 1,
                    overflow: 'auto',
                    background: 'var(--color-neutral-900)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--spacing-md)',
                    position: 'relative',
                    touchAction: 'none', // Prevent browser scrolling
                }}
                onMouseMove={handleMove}
                onTouchMove={handleMove}
                onMouseUp={handleMouseUp}
                onTouchEnd={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                {/* Instructions */}
                {showInstructions && textBoxes.length === 0 && (
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'rgba(0,0,0,0.9)',
                        padding: 'var(--spacing-xl)',
                        borderRadius: 'var(--radius-lg)',
                        textAlign: 'center',
                        zIndex: 100,
                        maxWidth: '400px',
                    }}>
                        <h3 style={{ color: 'var(--color-primary-400)', marginBottom: 'var(--spacing-md)' }}>
                            {locale === 'ar' ? 'كيفية الاستخدام' : 'Anleitung'}
                        </h3>
                        <ol style={{ color: 'white', textAlign: locale === 'ar' ? 'right' : 'left', lineHeight: 1.8 }}>
                            <li>{locale === 'ar' ? 'اضغط على أي حقل للكتابة فيه' : 'Klicken Sie auf ein Feld, um zu schreiben'}</li>
                            <li>{locale === 'ar' ? 'استخدم شريط الأدوات في الأعلى لأدوات إضافية' : 'Verwenden Sie die Toolbar oben für weitere Tools'}</li>
                            <li>{locale === 'ar' ? 'عند الانتهاء، اضغط "إنهاء" للحفظ' : 'Klicken Sie auf "Fertig", um zu speichern'}</li>
                        </ol>
                        <button
                            className="btn btn-secondary"
                            onClick={() => setShowInstructions(false)}
                            style={{ marginTop: 'var(--spacing-md)' }}
                        >
                            {locale === 'ar' ? 'ابدأ التحرير' : 'Bearbeitung starten'}
                        </button>
                    </div>
                )}

                {/* Form Image */}
                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                        ref={imageRef}
                        src={imageBase64}
                        alt="Form"
                        onClick={handleImageClick}
                        style={{
                            maxWidth: '100%',
                            display: 'block',
                            borderRadius: 'var(--radius-md)',
                            pointerEvents: 'none', // Allow clicking through to background if needed? No, we need click on image.
                            userSelect: 'none',
                        }}
                    />


                    {/* Text Boxes / Signatures */}
                    {textBoxes.map(box => (
                        <div
                            key={box.id}
                            id={box.id}
                            style={{
                                cursor: 'default',
                                userSelect: 'none',
                                transform: 'translate(0, 0)',
                                position: 'absolute',
                                left: `${box.x}%`,
                                top: `${box.y}%`,
                                zIndex: selectedBoxId === box.id ? 20 : 10,
                            }}
                        >
                            {box.type === 'signature' && box.imageUrl ? (
                                <div
                                    onMouseDown={(e) => handleBoxStart(e, box.id)}
                                    onTouchStart={(e) => handleBoxStart(e, box.id)}
                                    style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                                >
                                    <img
                                        src={box.imageUrl}
                                        alt="signature"
                                        draggable={false}
                                        style={{
                                            border: selectedBoxId === box.id ? '2px solid var(--color-primary-500)' : '1px dashed transparent',
                                            transform: `scale(${box.scale || 1})`,
                                            transformOrigin: 'top left',
                                        }}
                                    />
                                </div>
                            ) : (
                                <div style={{ position: 'relative' }}>
                                    {/* Drag Handle - Only visible when selected */}
                                    {selectedBoxId === box.id && (
                                        <div
                                            onMouseDown={(e) => handleBoxStart(e, box.id)}
                                            onTouchStart={(e) => handleBoxStart(e, box.id)}
                                            style={{
                                                position: 'absolute',
                                                top: '-24px',
                                                left: 0,
                                                background: 'var(--color-primary-600)',
                                                borderRadius: '4px 4px 0 0',
                                                padding: '2px 8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'grab',
                                                zIndex: 30,
                                                color: 'white',
                                                fontSize: '12px',
                                                whiteSpace: 'nowrap',
                                            }}
                                            title={locale === 'ar' ? 'اسحب للتحريك' : 'Ziehen zum Bewegen'}
                                        >
                                            {box.arabicQuestion ? (
                                                <span style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {box.arabicQuestion}
                                                </span>
                                            ) : (
                                                <span>✋</span>
                                            )}
                                        </div>
                                    )}

                                    {/* Question Label (Always visible for empty boxes to guide user) */}
                                    {!box.text && box.arabicQuestion && selectedBoxId !== box.id && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '-20px',
                                            right: 0,
                                            color: 'var(--color-primary-300)',
                                            fontSize: '11px',
                                            background: 'rgba(0,0,0,0.6)',
                                            padding: '2px 4px',
                                            borderRadius: '4px',
                                            pointerEvents: 'none',
                                            whiteSpace: 'nowrap',
                                            maxWidth: '200px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            direction: 'rtl'
                                        }}>
                                            {box.arabicQuestion}
                                        </div>
                                    )}

                                    <textarea
                                        value={box.text}
                                        dir="auto"
                                        placeholder={box.arabicQuestion || (locale === 'ar' ? 'اكتب هنا...' : 'Hier schreiben...')}
                                        onChange={(e) => handleTextChange(box.id, e.target.value)}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedBoxId(box.id);
                                        }}
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.7)',
                                            border: selectedBoxId === box.id
                                                ? '2px solid var(--color-primary-500)'
                                                : '1px solid rgba(0,0,0,0.2)',
                                            borderRadius: '4px',
                                            padding: '4px 8px',
                                            fontSize: `${box.fontSize}px`,
                                            fontFamily: 'Arial, sans-serif',
                                            color: '#000',
                                            fontWeight: 'bold',
                                            minWidth: '60px',
                                            minHeight: '30px',
                                            outline: 'none',
                                            resize: 'both',
                                            overflow: 'hidden',
                                            whiteSpace: 'pre-wrap',
                                            width: box.width ? `${box.width}px` : (box.text ? 'auto' : '120px'),
                                        }}
                                        onMouseDown={(e) => e.stopPropagation()}
                                    />
                                </div>
                            )}

                            {/* Delete button */}
                            {selectedBoxId === box.id && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteBox(box.id); }}
                                    style={{
                                        position: 'absolute',
                                        top: '-20px',
                                        right: '-20px',
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        background: '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        zIndex: 30,
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                    }}
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Signature Modal */}
            {
                showSignatureModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.8)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <div className="glass-card" style={{ padding: '2rem', width: '90%', maxWidth: '500px' }}>
                            <h3 style={{ marginBottom: '1rem', color: 'white' }}>
                                {locale === 'ar' ? 'توقيع' : 'Unterschrift'}
                            </h3>
                            <div style={{ background: 'white', borderRadius: '4px', overflow: 'hidden' }}>
                                <SignatureCanvas
                                    ref={sigCanvasRef}
                                    canvasProps={{
                                        width: 450,
                                        height: 200,
                                        className: 'sigCanvas',
                                        style: { width: '100%', height: '200px' }
                                    }}
                                    backgroundColor="rgba(255,255,255,0)"
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        sigCanvasRef.current?.clear();
                                    }}
                                >
                                    {locale === 'ar' ? 'مسح' : 'Löschen'}
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setShowSignatureModal(false)}
                                >
                                    {locale === 'ar' ? 'إلغاء' : 'Abbrechen'}
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSaveSignature}
                                >
                                    {locale === 'ar' ? 'حفظ' : 'Speichern'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
