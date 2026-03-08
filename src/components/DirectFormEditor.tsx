import React, { useState, useRef, useEffect, useCallback } from 'react';
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
    fieldId?: string; // link back to the original field
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
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [sidebarAnswers, setSidebarAnswers] = useState<Record<string, string>>({});
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [dragOverImage, setDragOverImage] = useState(false);
    const [highlightedFieldId, setHighlightedFieldId] = useState<string | null>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const sigCanvasRef = useRef<SignatureCanvas>(null);
    const [isTranslating, setIsTranslating] = useState(false);

    // Initialize sidebar answers from fields
    useEffect(() => {
        const initial: Record<string, string> = {};
        fields.forEach(field => {
            initial[field.id] = field.existingValue || '';
        });
        setSidebarAnswers(initial);
    }, [fields]);

    // Helper to detect text direction
    const getDirection = (text: string) => {
        const arabicPattern = /[\u0600-\u06FF]/;
        return arabicPattern.test(text) ? 'rtl' : 'ltr';
    };

    // Check if a field has already been placed on the form
    const isFieldPlaced = useCallback((fieldId: string) => {
        return textBoxes.some(box => box.fieldId === fieldId);
    }, [textBoxes]);

    // Handle dropping a sidebar answer onto the form image
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOverImage(false);
        const rect = imageRef.current?.getBoundingClientRect();
        if (!rect) return;

        const fieldId = e.dataTransfer.getData('fieldId');
        const text = e.dataTransfer.getData('text');

        if (!fieldId || !text.trim()) return;

        // If already placed, move it instead
        const existingBox = textBoxes.find(b => b.fieldId === fieldId);
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        if (existingBox) {
            setTextBoxes(prev => prev.map(box =>
                box.fieldId === fieldId
                    ? { ...box, x: Math.max(0, Math.min(95, x)), y: Math.max(0, Math.min(95, y)), text }
                    : box
            ));
            setSelectedBoxId(existingBox.id);
            return;
        }

        const field = fields.find(f => f.id === fieldId);

        const newBox: TextBox = {
            id: `box_${Date.now()}`,
            text: text,
            type: 'text',
            x: Math.max(0, Math.min(95, x)),
            y: Math.max(0, Math.min(95, y)),
            fontSize: 14,
            germanQuestion: field?.germanQuestion,
            arabicQuestion: field?.arabicQuestion,
            isTranslated: false,
            fieldId: fieldId,
        };

        setTextBoxes(prev => [...prev, newBox]);
        setSelectedBoxId(newBox.id);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOverImage(true);
    };

    const handleDragLeave = () => {
        setDragOverImage(false);
    };

    // Handle clicking on the image to add a free text box
    const handleImageClick = (e: React.MouseEvent) => {
        if (isDragging) return;
        // Don't add box if clicking on an existing element
        const target = e.target as HTMLElement;
        if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT' || target.closest('[data-textbox]')) return;

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
    };

    // Handle dragging an existing text box (repositioning on the image)
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
                x: box.x + deltaX,
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

    // Place all sidebar answers at once (auto-place using field positions)
    const handlePlaceAll = () => {
        const newBoxes: TextBox[] = [];
        fields.forEach((field, index) => {
            const answer = sidebarAnswers[field.id];
            if (!answer?.trim()) return;
            if (isFieldPlaced(field.id)) return;

            newBoxes.push({
                id: `box_${Date.now()}_${index}`,
                text: answer,
                type: 'text',
                x: field.position?.x || 10 + (index % 3) * 30,
                y: field.position?.y || 10 + index * 6,
                fontSize: 14,
                germanQuestion: field.germanQuestion,
                arabicQuestion: field.arabicQuestion,
                isTranslated: false,
                fieldId: field.id,
            });
        });

        if (newBoxes.length > 0) {
            setTextBoxes(prev => [...prev, ...newBoxes]);
        }
    };

    // Complete and send to parent (Finalize)
    const handleFinalize = () => {
        if (!imageRef.current) return;
        const imgRect = imageRef.current.getBoundingClientRect();

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
            const signatureData = sigCanvasRef.current.toDataURL();
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

    // Handle sidebar drag start
    const handleSidebarDragStart = (e: React.DragEvent, fieldId: string) => {
        const answer = sidebarAnswers[fieldId] || '';
        if (!answer.trim()) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.setData('fieldId', fieldId);
        e.dataTransfer.setData('text', answer);
        e.dataTransfer.effectAllowed = 'move';
    };

    // Sidebar answer change
    const handleSidebarAnswerChange = (fieldId: string, value: string) => {
        setSidebarAnswers(prev => ({ ...prev, [fieldId]: value }));
        // Also update the corresponding text box if placed
        const existingBox = textBoxes.find(b => b.fieldId === fieldId);
        if (existingBox) {
            setTextBoxes(prev => prev.map(box =>
                box.fieldId === fieldId ? { ...box, text: value, isTranslated: false } : box
            ));
        }
    };

    const selectedBox = textBoxes.find(b => b.id === selectedBoxId);
    const answeredCount = Object.values(sidebarAnswers).filter(v => v.trim()).length;
    const placedCount = fields.filter(f => isFieldPlaced(f.id)).length;

    return (
        <div className="direct-editor-container" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0',
            height: 'calc(100vh - 150px)',
            minHeight: '600px',
        }}>
            {/* Top Toolbar */}
            <div style={{
                display: 'flex',
                gap: 'var(--spacing-sm)',
                padding: 'var(--spacing-sm) var(--spacing-md)',
                background: 'var(--glass-bg)',
                borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid var(--glass-border)',
            }}>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        style={{ fontSize: '0.875rem', padding: '6px 10px' }}
                        title={sidebarCollapsed
                            ? (locale === 'ar' ? 'إظهار الأسئلة' : 'Fragen anzeigen')
                            : (locale === 'ar' ? 'إخفاء الأسئلة' : 'Fragen ausblenden')
                        }
                    >
                        {sidebarCollapsed ? '📋' : '📋✕'}
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
                            <button onClick={() => handleFontSizeChange(selectedBox.id, -2)} style={{ padding: '0 6px', cursor: 'pointer', color: 'white', background: 'none', border: 'none', fontSize: '1rem' }}>−</button>
                            <span style={{ fontSize: '0.8rem', color: 'white', minWidth: '32px', textAlign: 'center' }}>
                                {selectedBox.type === 'signature' ? (selectedBox.scale || 1).toFixed(1) + 'x' : selectedBox.fontSize + 'px'}
                            </span>
                            <button onClick={() => handleFontSizeChange(selectedBox.id, 2)} style={{ padding: '0 6px', cursor: 'pointer', color: 'white', background: 'none', border: 'none', fontSize: '1rem' }}>+</button>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
                        {placedCount}/{fields.length} {locale === 'ar' ? 'تم وضعه' : 'platziert'}
                    </span>
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

            {/* Main Layout: Sidebar + Image */}
            <div style={{
                display: 'flex',
                flex: 1,
                overflow: 'hidden',
                borderRadius: '0 0 var(--radius-md) var(--radius-md)',
                direction: locale === 'ar' ? 'rtl' : 'ltr',
            }}>
                {/* ── Questions Sidebar ── */}
                {!sidebarCollapsed && (
                    <div
                        className="editor-sidebar"
                        style={{
                            width: '320px',
                            minWidth: '280px',
                            maxWidth: '360px',
                            background: 'linear-gradient(180deg, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.85) 100%)',
                            backdropFilter: 'blur(16px)',
                            borderRight: locale === 'ar' ? 'none' : '1px solid var(--glass-border)',
                            borderLeft: locale === 'ar' ? '1px solid var(--glass-border)' : 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            direction: locale === 'ar' ? 'rtl' : 'ltr',
                        }}
                    >
                        {/* Sidebar Header */}
                        <div style={{
                            padding: '0.75rem 1rem',
                            borderBottom: '1px solid var(--glass-border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexShrink: 0,
                        }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '0.95rem', color: 'white', fontWeight: 600 }}>
                                    {locale === 'ar' ? '📝 الأسئلة' : '📝 Fragen'}
                                </h3>
                                <p style={{ margin: '2px 0 0', fontSize: '0.7rem', color: 'var(--color-neutral-500)' }}>
                                    {locale === 'ar'
                                        ? 'املأ الإجابات واسحبها إلى النموذج'
                                        : 'Antworten ausfüllen & auf Formular ziehen'}
                                </p>
                            </div>
                        </div>

                        {/* Place All Button */}
                        {answeredCount > placedCount && (
                            <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--glass-border)', flexShrink: 0 }}>
                                <button
                                    className="btn btn-primary"
                                    onClick={handlePlaceAll}
                                    style={{
                                        width: '100%',
                                        fontSize: '0.8rem',
                                        padding: '0.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.4rem',
                                    }}
                                >
                                    <span>📌</span>
                                    {locale === 'ar'
                                        ? `وضع الكل (${answeredCount - placedCount})`
                                        : `Alle platzieren (${answeredCount - placedCount})`}
                                </button>
                            </div>
                        )}

                        {/* Questions List */}
                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '0.5rem',
                        }}>
                            {fields.map((field, index) => {
                                const placed = isFieldPlaced(field.id);
                                const answer = sidebarAnswers[field.id] || '';
                                const canDrag = answer.trim().length > 0;

                                return (
                                    <div
                                        key={field.id}
                                        draggable={canDrag}
                                        onDragStart={(e) => handleSidebarDragStart(e, field.id)}
                                        onMouseEnter={() => {
                                            const box = textBoxes.find(b => b.fieldId === field.id);
                                            if (box) setHighlightedFieldId(box.id);
                                        }}
                                        onMouseLeave={() => setHighlightedFieldId(null)}
                                        style={{
                                            padding: '0.65rem 0.75rem',
                                            marginBottom: '0.4rem',
                                            borderRadius: '8px',
                                            background: placed
                                                ? 'rgba(34,197,94,0.08)'
                                                : 'rgba(255,255,255,0.03)',
                                            border: placed
                                                ? '1px solid rgba(34,197,94,0.25)'
                                                : '1px solid rgba(255,255,255,0.06)',
                                            cursor: canDrag ? 'grab' : 'default',
                                            transition: 'all 0.2s ease',
                                            position: 'relative',
                                        }}
                                    >
                                        {/* Question number badge + status */}
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            marginBottom: '0.35rem',
                                        }}>
                                            <span style={{
                                                width: '22px',
                                                height: '22px',
                                                borderRadius: '50%',
                                                background: placed
                                                    ? 'var(--color-success-600)'
                                                    : 'var(--color-primary-600)',
                                                color: 'white',
                                                fontSize: '0.7rem',
                                                fontWeight: 700,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                            }}>
                                                {placed ? '✓' : index + 1}
                                            </span>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{
                                                    margin: 0,
                                                    fontSize: '0.75rem',
                                                    color: 'var(--color-neutral-400)',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    direction: 'ltr',
                                                    textAlign: locale === 'ar' ? 'right' : 'left',
                                                }}>
                                                    🇩🇪 {field.germanQuestion}
                                                </p>
                                            </div>
                                            {canDrag && !placed && (
                                                <span style={{
                                                    fontSize: '0.65rem',
                                                    color: 'var(--color-primary-400)',
                                                    flexShrink: 0,
                                                    opacity: 0.8,
                                                }}>
                                                    {locale === 'ar' ? 'اسحب ←' : '→ ziehen'}
                                                </span>
                                            )}
                                        </div>

                                        {/* Arabic question */}
                                        {field.arabicQuestion && (
                                            <p style={{
                                                margin: '0 0 0.35rem',
                                                fontSize: '0.8rem',
                                                color: 'var(--color-neutral-200)',
                                                direction: 'rtl',
                                                textAlign: 'right',
                                                lineHeight: 1.4,
                                            }}>
                                                {field.arabicQuestion}
                                            </p>
                                        )}

                                        {/* Answer input */}
                                        <input
                                            type="text"
                                            value={answer}
                                            dir="auto"
                                            onChange={(e) => handleSidebarAnswerChange(field.id, e.target.value)}
                                            placeholder={locale === 'ar' ? 'اكتب الإجابة هنا...' : 'Antwort eingeben...'}
                                            style={{
                                                width: '100%',
                                                padding: '0.4rem 0.6rem',
                                                borderRadius: '6px',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                background: 'rgba(255,255,255,0.06)',
                                                color: 'white',
                                                fontSize: '0.82rem',
                                                outline: 'none',
                                                transition: 'border-color 0.2s',
                                            }}
                                            onFocus={(e) => {
                                                e.currentTarget.style.borderColor = 'var(--color-primary-500)';
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── Form Image Area ── */}
                <div
                    ref={containerRef}
                    className="image-container"
                    style={{
                        flex: 1,
                        overflow: 'auto',
                        background: 'var(--color-neutral-900)',
                        padding: 'var(--spacing-md)',
                        position: 'relative',
                        touchAction: 'none',
                        direction: 'ltr', // Image area always LTR
                        transition: 'background 0.2s ease',
                        ...(dragOverImage ? {
                            background: 'rgba(99,102,241,0.08)',
                            boxShadow: 'inset 0 0 40px rgba(99,102,241,0.1)',
                        } : {}),
                    }}
                    onMouseMove={handleMove}
                    onTouchMove={handleMove}
                    onMouseUp={handleMouseUp}
                    onTouchEnd={handleMouseUp}
                    onMouseLeave={() => { handleMouseUp(); setDragOverImage(false); }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {/* Drop zone overlay hint */}
                    {dragOverImage && (
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            pointerEvents: 'none',
                            zIndex: 50,
                        }}>
                            <div style={{
                                padding: '1rem 2rem',
                                borderRadius: '12px',
                                background: 'rgba(99,102,241,0.9)',
                                color: 'white',
                                fontSize: '1rem',
                                fontWeight: 600,
                                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                                animation: 'pulse 1.5s infinite',
                            }}>
                                {locale === 'ar' ? '📌 أفلت هنا لوضع الإجابة' : '📌 Hier ablegen zum Platzieren'}
                            </div>
                        </div>
                    )}

                    {/* Empty state */}
                    {textBoxes.length === 0 && !dragOverImage && (
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            background: 'rgba(0,0,0,0.85)',
                            backdropFilter: 'blur(8px)',
                            padding: '2rem',
                            borderRadius: '16px',
                            textAlign: 'center',
                            zIndex: 100,
                            maxWidth: '380px',
                            border: '1px solid var(--glass-border)',
                            pointerEvents: 'auto',
                        }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🖱️</div>
                            <h3 style={{ color: 'var(--color-primary-400)', marginBottom: '0.5rem', fontSize: '1rem' }}>
                                {locale === 'ar' ? 'كيفية الاستخدام' : 'Anleitung'}
                            </h3>
                            <div style={{ color: 'var(--color-neutral-300)', fontSize: '0.85rem', lineHeight: 1.7, textAlign: locale === 'ar' ? 'right' : 'left' }}>
                                <p style={{ margin: '0.4rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ flexShrink: 0 }}>1️⃣</span>
                                    {locale === 'ar'
                                        ? 'اكتب إجاباتك في الشريط الجانبي'
                                        : 'Schreiben Sie Antworten in die Seitenleiste'}
                                </p>
                                <p style={{ margin: '0.4rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ flexShrink: 0 }}>2️⃣</span>
                                    {locale === 'ar'
                                        ? 'اسحب الإجابة وأفلتها على النموذج'
                                        : 'Antwort auf das Formular ziehen und ablegen'}
                                </p>
                                <p style={{ margin: '0.4rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ flexShrink: 0 }}>3️⃣</span>
                                    {locale === 'ar'
                                        ? 'أو اضغط "وضع الكل" للتوزيع التلقائي'
                                        : 'Oder "Alle platzieren" für automatische Verteilung'}
                                </p>
                            </div>
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
                                userSelect: 'none',
                            }}
                        />

                        {/* Text Boxes / Signatures */}
                        {textBoxes.map(box => (
                            <div
                                key={box.id}
                                id={box.id}
                                data-textbox="true"
                                style={{
                                    cursor: 'default',
                                    userSelect: 'none',
                                    transform: 'translate(0, 0)',
                                    position: 'absolute',
                                    left: `${box.x}%`,
                                    top: `${box.y}%`,
                                    zIndex: selectedBoxId === box.id ? 20 : 10,
                                    transition: isDragging && selectedBoxId === box.id ? 'none' : 'box-shadow 0.2s ease',
                                    ...(highlightedFieldId === box.id ? {
                                        filter: 'drop-shadow(0 0 8px rgba(99,102,241,0.7))',
                                    } : {}),
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

                                        {/* Question Label (Always visible for empty boxes) */}
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
            </div>

            {/* Signature Modal */}
            {showSignatureModal && (
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
            )}
        </div>
    );
}
