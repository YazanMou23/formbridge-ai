import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { FormField, Locale } from '@/types';
import SignatureCanvas from 'react-signature-canvas';
import { apiFetch } from '@/lib/apiHelper';

export interface TextBox {
    id: string;
    text: string;
    type?: 'text' | 'signature';
    imageUrl?: string;
    x: number;  // percentage of image width
    y: number;  // percentage of image height
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
    fields: FormField[];
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
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [dragOverImage, setDragOverImage] = useState(false);
    const [highlightedFieldId, setHighlightedFieldId] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const imageRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const sigCanvasRef = useRef<SignatureCanvas>(null);
    const [isTranslating, setIsTranslating] = useState(false);
    const [pendingPlaceFieldId, setPendingPlaceFieldId] = useState<string | null>(null);

    // Detect mobile
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    // Collapse sidebar by default on mobile
    useEffect(() => {
        if (isMobile) setSidebarOpen(false);
    }, [isMobile]);

    // Initialize sidebar answers from fields
    useEffect(() => {
        const initial: Record<string, string> = {};
        fields.forEach(field => {
            initial[field.id] = field.existingValue || '';
        });
        setSidebarAnswers(initial);
    }, [fields]);

    // Get position percentage relative to the image
    const getImagePercent = useCallback((clientX: number, clientY: number) => {
        const rect = imageRef.current?.getBoundingClientRect();
        if (!rect) return null;
        return {
            x: ((clientX - rect.left) / rect.width) * 100,
            y: ((clientY - rect.top) / rect.height) * 100,
        };
    }, []);

    // Check if a field has already been placed on the form
    const isFieldPlaced = useCallback((fieldId: string) => {
        return textBoxes.some(box => box.fieldId === fieldId);
    }, [textBoxes]);

    // ────────── Drop from sidebar ──────────
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOverImage(false);

        const fieldId = e.dataTransfer.getData('fieldId');
        const text = e.dataTransfer.getData('text');
        if (!fieldId || !text.trim()) return;

        const pos = getImagePercent(e.clientX, e.clientY);
        if (!pos) return;

        const x = Math.max(0, Math.min(95, pos.x));
        const y = Math.max(0, Math.min(95, pos.y));

        // If already placed, reposition
        const existingBox = textBoxes.find(b => b.fieldId === fieldId);
        if (existingBox) {
            setTextBoxes(prev => prev.map(box =>
                box.fieldId === fieldId ? { ...box, x, y, text } : box
            ));
            setSelectedBoxId(existingBox.id);
            return;
        }

        const field = fields.find(f => f.id === fieldId);
        const newBox: TextBox = {
            id: `box_${Date.now()}`,
            text,
            type: 'text',
            x,
            y,
            fontSize: 14,
            germanQuestion: field?.germanQuestion,
            arabicQuestion: field?.arabicQuestion,
            isTranslated: false,
            fieldId,
        };
        setTextBoxes(prev => [...prev, newBox]);
        setSelectedBoxId(newBox.id);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOverImage(true);
    };
    const handleDragLeave = () => setDragOverImage(false);

    // ────────── Tap-to-place (mobile) ──────────
    const handleImageTap = (e: React.MouseEvent) => {
        if (isDragging) return;
        const target = e.target as HTMLElement;
        if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT' || target.closest('[data-textbox]')) return;

        const pos = getImagePercent(e.clientX, e.clientY);
        if (!pos) return;

        // If there's a pending field from mobile sidebar, place it
        if (pendingPlaceFieldId) {
            const answer = sidebarAnswers[pendingPlaceFieldId] || '';
            if (answer.trim()) {
                const field = fields.find(f => f.id === pendingPlaceFieldId);
                const existing = textBoxes.find(b => b.fieldId === pendingPlaceFieldId);

                if (existing) {
                    setTextBoxes(prev => prev.map(box =>
                        box.fieldId === pendingPlaceFieldId
                            ? { ...box, x: pos.x, y: pos.y, text: answer }
                            : box
                    ));
                } else {
                    const newBox: TextBox = {
                        id: `box_${Date.now()}`,
                        text: answer,
                        type: 'text',
                        x: pos.x,
                        y: pos.y,
                        fontSize: 14,
                        germanQuestion: field?.germanQuestion,
                        arabicQuestion: field?.arabicQuestion,
                        isTranslated: false,
                        fieldId: pendingPlaceFieldId,
                    };
                    setTextBoxes(prev => [...prev, newBox]);
                    setSelectedBoxId(newBox.id);
                }
            }
            setPendingPlaceFieldId(null);
            return;
        }

        // Otherwise add free text box
        const newBox: TextBox = {
            id: `box_${Date.now()}`,
            text: '',
            type: 'text',
            x: pos.x,
            y: pos.y,
            fontSize: 14,
        };
        setTextBoxes(prev => [...prev, newBox]);
        setSelectedBoxId(newBox.id);
    };

    // ────────── Dragging text boxes on the image ──────────
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
        if ('touches' in e && e.cancelable) e.preventDefault();

        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

        const rect = imageRef.current.getBoundingClientRect();
        const deltaX = ((clientX - dragStart.x) / rect.width) * 100;
        const deltaY = ((clientY - dragStart.y) / rect.height) * 100;

        setTextBoxes(prev => prev.map(box => {
            if (box.id !== selectedBoxId) return box;
            return { ...box, x: box.x + deltaX, y: box.y + deltaY };
        }));
        setDragStart({ x: clientX, y: clientY });
    };

    const handleMouseUp = () => setIsDragging(false);

    // ────────── Text editing ──────────
    const handleTextChange = (boxId: string, text: string) => {
        setTextBoxes(prev => prev.map(box =>
            box.id === boxId ? { ...box, text, isTranslated: false } : box
        ));
    };

    const handleDeleteBox = (boxId: string) => {
        setTextBoxes(prev => prev.filter(box => box.id !== boxId));
        if (selectedBoxId === boxId) setSelectedBoxId(null);
    };

    const handleFontSizeChange = (boxId: string, delta: number) => {
        setTextBoxes(prev => prev.map(box => {
            if (box.id !== boxId) return box;
            if (box.type === 'signature') {
                return { ...box, scale: Math.max(0.5, Math.min(3, (box.scale || 1) + (delta * 0.1))) };
            }
            return { ...box, fontSize: Math.max(8, Math.min(32, box.fontSize + delta)) };
        }));
    };

    // ────────── Translate ──────────
    const handleTranslateInPlace = async () => {
        setIsTranslating(true);
        try {
            const boxesToTranslate = textBoxes.filter(b => b.text.trim() && !b.isTranslated && b.type !== 'signature');
            if (boxesToTranslate.length === 0) { setIsTranslating(false); return; }

            const res = await apiFetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    answers: boxesToTranslate.map(box => ({ fieldId: box.id, arabicAnswer: box.text }))
                }),
            });
            const data = await res.json();
            if (data.success && data.translations) {
                setTextBoxes(prev => prev.map(box => {
                    const tr = data.translations.find((t: any) => t.fieldId === box.id);
                    return tr ? { ...box, text: tr.germanAnswer, isTranslated: true } : box;
                }));
            }
        } catch (error) {
            console.error('Translation failed', error);
        } finally {
            setIsTranslating(false);
        }
    };

    // ────────── Place All ──────────
    const handlePlaceAll = () => {
        const newBoxes: TextBox[] = [];
        fields.forEach((field, index) => {
            const answer = sidebarAnswers[field.id];
            if (!answer?.trim() || isFieldPlaced(field.id)) return;

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
        if (newBoxes.length > 0) setTextBoxes(prev => [...prev, ...newBoxes]);
    };

    // ────────── Finalize — recalculate exact positions ──────────
    const handleFinalize = () => {
        if (!imageRef.current) return;
        const imgRect = imageRef.current.getBoundingClientRect();

        // Recalculate all positions from actual rendered DOM for pixel-perfect accuracy
        const finalizedBoxes = textBoxes
            .filter(box => (box.type === 'signature' || box.text.trim()))
            .map(box => {
                const element = document.getElementById(box.id);
                if (!element) return box;

                const outerRect = element.getBoundingClientRect();

                // Find the textarea or signature img inside
                const textarea = element.querySelector('textarea');
                const sigImg = element.querySelector('img[alt="signature"]');
                const innerEl = textarea || sigImg;

                if (innerEl) {
                    const innerRect = innerEl.getBoundingClientRect();
                    // Use the INNER element's position relative to the image
                    // This is the exact position where text is visible
                    return {
                        ...box,
                        x: ((innerRect.left - imgRect.left) / imgRect.width) * 100,
                        y: ((innerRect.top - imgRect.top) / imgRect.height) * 100,
                        width: (innerRect.width / imgRect.width) * 100,
                        height: (innerRect.height / imgRect.height) * 100,
                    };
                }

                // Fallback to outer element
                return {
                    ...box,
                    x: ((outerRect.left - imgRect.left) / imgRect.width) * 100,
                    y: ((outerRect.top - imgRect.top) / imgRect.height) * 100,
                    width: (outerRect.width / imgRect.width) * 100,
                    height: (outerRect.height / imgRect.height) * 100,
                };
            });

        onComplete(finalizedBoxes);
    };

    // ────────── Signature ──────────
    const handleSaveSignature = () => {
        if (sigCanvasRef.current) {
            const signatureData = sigCanvasRef.current.toDataURL();
            const newBox: TextBox = {
                id: `sig_${Date.now()}`,
                text: 'Signature',
                type: 'signature',
                imageUrl: signatureData,
                x: 40, y: 40,
                fontSize: 14,
                scale: 1,
            };
            setTextBoxes(prev => [...prev, newBox]);
            setSelectedBoxId(newBox.id);
            setShowSignatureModal(false);
        }
    };

    // ────────── Sidebar drag start ──────────
    const handleSidebarDragStart = (e: React.DragEvent, fieldId: string) => {
        const answer = sidebarAnswers[fieldId] || '';
        if (!answer.trim()) { e.preventDefault(); return; }
        e.dataTransfer.setData('fieldId', fieldId);
        e.dataTransfer.setData('text', answer);
        e.dataTransfer.effectAllowed = 'move';
    };

    // Sidebar answer change — also update placed box
    const handleSidebarAnswerChange = (fieldId: string, value: string) => {
        setSidebarAnswers(prev => ({ ...prev, [fieldId]: value }));
        const existingBox = textBoxes.find(b => b.fieldId === fieldId);
        if (existingBox) {
            setTextBoxes(prev => prev.map(box =>
                box.fieldId === fieldId ? { ...box, text: value, isTranslated: false } : box
            ));
        }
    };

    // Mobile: tap on sidebar card to activate "place" mode
    const handleMobilePlaceField = (fieldId: string) => {
        const answer = sidebarAnswers[fieldId] || '';
        if (!answer.trim()) return;
        setPendingPlaceFieldId(fieldId);
        setSidebarOpen(false); // Close sidebar so user can tap on the form
    };

    const selectedBox = textBoxes.find(b => b.id === selectedBoxId);
    const answeredCount = Object.values(sidebarAnswers).filter(v => v.trim()).length;
    const placedCount = fields.filter(f => isFieldPlaced(f.id)).length;

    return (
        <div className="direct-editor-container" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0',
            height: isMobile ? 'calc(100vh - 120px)' : 'calc(100vh - 150px)',
            minHeight: isMobile ? '400px' : '600px',
        }}>
            {/* Top Toolbar */}
            <div style={{
                display: 'flex',
                gap: '0.4rem',
                padding: isMobile ? '0.4rem' : '0.5rem 0.75rem',
                background: 'var(--glass-bg)',
                borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid var(--glass-border)',
            }}>
                <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        style={{ fontSize: '0.8rem', padding: '5px 8px' }}
                    >
                        📋 {!isMobile && (sidebarOpen
                            ? (locale === 'ar' ? 'إخفاء' : 'Ausblenden')
                            : (locale === 'ar' ? 'الأسئلة' : 'Fragen')
                        )}
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setShowSignatureModal(true)}
                        style={{ fontSize: '0.8rem', padding: '5px 8px' }}
                    >
                        ✍️{!isMobile && (locale === 'ar' ? ' توقيع' : ' Unterschrift')}
                    </button>
                    {selectedBox && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.3rem',
                            background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px'
                        }}>
                            <button onClick={() => handleFontSizeChange(selectedBox.id, -2)}
                                style={{ padding: '0 5px', cursor: 'pointer', color: 'white', background: 'none', border: 'none', fontSize: '0.9rem' }}>−</button>
                            <span style={{ fontSize: '0.75rem', color: 'white', minWidth: '28px', textAlign: 'center' }}>
                                {selectedBox.type === 'signature' ? (selectedBox.scale || 1).toFixed(1) + 'x' : selectedBox.fontSize + 'px'}
                            </span>
                            <button onClick={() => handleFontSizeChange(selectedBox.id, 2)}
                                style={{ padding: '0 5px', cursor: 'pointer', color: 'white', background: 'none', border: 'none', fontSize: '0.9rem' }}>+</button>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-neutral-400)' }}>
                        {placedCount}/{fields.length}
                    </span>
                    <button
                        className="btn btn-secondary"
                        onClick={handleTranslateInPlace}
                        disabled={isTranslating}
                        style={{ fontSize: '0.8rem', padding: '5px 8px' }}
                    >
                        {isTranslating ? <span className="loading-spinner" style={{ width: 12, height: 12 }} /> : '🌍'}
                        {!isMobile && (locale === 'ar' ? ' ترجمة' : ' Übersetzen')}
                    </button>
                    <button className="btn btn-primary" onClick={handleFinalize}
                        style={{ fontSize: '0.8rem', padding: '5px 10px' }}>
                        {locale === 'ar' ? '✅ إنهاء' : '✅ Fertig'}
                    </button>
                </div>
            </div>

            {/* Pending place mode banner (mobile) */}
            {pendingPlaceFieldId && (
                <div style={{
                    padding: '0.5rem 1rem',
                    background: 'rgba(99,102,241,0.9)',
                    color: 'white',
                    textAlign: 'center',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                }}>
                    <span>📌</span>
                    {locale === 'ar'
                        ? 'اضغط على المكان المناسب في النموذج'
                        : 'Tippen Sie auf die richtige Stelle im Formular'}
                    <button onClick={() => setPendingPlaceFieldId(null)}
                        style={{ background: 'rgba(255,255,255,0.3)', border: 'none', color: 'white', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer', fontSize: '0.8rem' }}>
                        ✕
                    </button>
                </div>
            )}

            {/* Main Layout */}
            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                flex: 1,
                overflow: 'hidden',
                borderRadius: '0 0 var(--radius-md) var(--radius-md)',
                direction: locale === 'ar' ? 'rtl' : 'ltr',
            }}>
                {/* ── Questions Sidebar ── */}
                {sidebarOpen && (
                    <div style={{
                        width: isMobile ? '100%' : '320px',
                        minWidth: isMobile ? 'auto' : '280px',
                        maxWidth: isMobile ? '100%' : '360px',
                        maxHeight: isMobile ? '45vh' : 'none',
                        background: 'linear-gradient(180deg, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.85) 100%)',
                        backdropFilter: 'blur(16px)',
                        borderRight: locale === 'ar' || isMobile ? 'none' : '1px solid var(--glass-border)',
                        borderLeft: locale === 'ar' && !isMobile ? '1px solid var(--glass-border)' : 'none',
                        borderBottom: isMobile ? '1px solid var(--glass-border)' : 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        direction: locale === 'ar' ? 'rtl' : 'ltr',
                    }}>
                        {/* Sidebar Header */}
                        <div style={{
                            padding: '0.6rem 0.8rem',
                            borderBottom: '1px solid var(--glass-border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexShrink: 0,
                        }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'white', fontWeight: 600 }}>
                                    {locale === 'ar' ? '📝 الأسئلة' : '📝 Fragen'}
                                </h3>
                                <p style={{ margin: '2px 0 0', fontSize: '0.65rem', color: 'var(--color-neutral-500)' }}>
                                    {isMobile
                                        ? (locale === 'ar' ? 'املأ واضغط 📌 ثم اضغط على النموذج' : 'Ausfüllen → 📌 → auf Formular tippen')
                                        : (locale === 'ar' ? 'املأ الإجابات واسحبها إلى النموذج' : 'Antworten ausfüllen & auf Formular ziehen')
                                    }
                                </p>
                            </div>
                            {isMobile && (
                                <button onClick={() => setSidebarOpen(false)}
                                    style={{ background: 'none', border: 'none', color: 'var(--color-neutral-400)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                            )}
                        </div>

                        {/* Place All Button */}
                        {answeredCount > placedCount && (
                            <div style={{ padding: '0.4rem 0.8rem', borderBottom: '1px solid var(--glass-border)', flexShrink: 0 }}>
                                <button className="btn btn-primary" onClick={handlePlaceAll}
                                    style={{ width: '100%', fontSize: '0.75rem', padding: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                                    <span>📌</span>
                                    {locale === 'ar'
                                        ? `وضع الكل (${answeredCount - placedCount})`
                                        : `Alle platzieren (${answeredCount - placedCount})`}
                                </button>
                            </div>
                        )}

                        {/* Questions List */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '0.4rem' }}>
                            {fields.map((field, index) => {
                                const placed = isFieldPlaced(field.id);
                                const answer = sidebarAnswers[field.id] || '';
                                const canDrag = answer.trim().length > 0;
                                const isPending = pendingPlaceFieldId === field.id;

                                return (
                                    <div
                                        key={field.id}
                                        draggable={canDrag && !isMobile}
                                        onDragStart={(e) => handleSidebarDragStart(e, field.id)}
                                        onMouseEnter={() => {
                                            const box = textBoxes.find(b => b.fieldId === field.id);
                                            if (box) setHighlightedFieldId(box.id);
                                        }}
                                        onMouseLeave={() => setHighlightedFieldId(null)}
                                        style={{
                                            padding: '0.5rem 0.6rem',
                                            marginBottom: '0.35rem',
                                            borderRadius: '8px',
                                            background: isPending
                                                ? 'rgba(99,102,241,0.15)'
                                                : placed
                                                    ? 'rgba(34,197,94,0.08)'
                                                    : 'rgba(255,255,255,0.03)',
                                            border: isPending
                                                ? '1px solid rgba(99,102,241,0.5)'
                                                : placed
                                                    ? '1px solid rgba(34,197,94,0.25)'
                                                    : '1px solid rgba(255,255,255,0.06)',
                                            cursor: canDrag && !isMobile ? 'grab' : 'default',
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        {/* Question header */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                                            <span style={{
                                                width: '20px', height: '20px', borderRadius: '50%',
                                                background: placed ? 'var(--color-success-600)' : 'var(--color-primary-600)',
                                                color: 'white', fontSize: '0.65rem', fontWeight: 700,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                            }}>
                                                {placed ? '✓' : index + 1}
                                            </span>
                                            <p style={{
                                                margin: 0, fontSize: '0.7rem', color: 'var(--color-neutral-400)',
                                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                flex: 1, direction: 'ltr', textAlign: locale === 'ar' ? 'right' : 'left',
                                            }}>
                                                🇩🇪 {field.germanQuestion}
                                            </p>
                                        </div>

                                        {/* Arabic question */}
                                        {field.arabicQuestion && (
                                            <p style={{
                                                margin: '0 0 0.3rem', fontSize: '0.75rem', color: 'var(--color-neutral-200)',
                                                direction: 'rtl', textAlign: 'right', lineHeight: 1.3,
                                            }}>
                                                {field.arabicQuestion}
                                            </p>
                                        )}

                                        {/* Answer input + place button */}
                                        <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                                            <input
                                                type="text"
                                                value={answer}
                                                dir="auto"
                                                onChange={(e) => handleSidebarAnswerChange(field.id, e.target.value)}
                                                placeholder={locale === 'ar' ? 'الإجابة...' : 'Antwort...'}
                                                style={{
                                                    flex: 1, padding: '0.35rem 0.5rem', borderRadius: '6px',
                                                    border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)',
                                                    color: 'white', fontSize: '0.8rem', outline: 'none', minWidth: 0,
                                                }}
                                                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary-500)'; }}
                                                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                                            />
                                            {/* Mobile: tap-to-place button */}
                                            {isMobile && canDrag && !placed && (
                                                <button
                                                    onClick={() => handleMobilePlaceField(field.id)}
                                                    style={{
                                                        background: isPending ? 'var(--color-primary-500)' : 'rgba(99,102,241,0.3)',
                                                        border: 'none', color: 'white', borderRadius: '6px',
                                                        padding: '0.35rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem',
                                                        flexShrink: 0, whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    📌
                                                </button>
                                            )}
                                            {/* Desktop: drag hint */}
                                            {!isMobile && canDrag && !placed && (
                                                <span style={{ fontSize: '0.6rem', color: 'var(--color-primary-400)', flexShrink: 0, opacity: 0.7 }}>
                                                    {locale === 'ar' ? '← اسحب' : 'ziehen →'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── Form Image Area ── */}
                <div
                    ref={containerRef}
                    style={{
                        flex: 1,
                        overflow: 'auto',
                        background: 'var(--color-neutral-900)',
                        padding: isMobile ? '0.5rem' : 'var(--spacing-md)',
                        position: 'relative',
                        touchAction: 'none',
                        direction: 'ltr',
                        transition: 'background 0.2s ease',
                        ...(dragOverImage ? {
                            background: 'rgba(99,102,241,0.08)',
                            boxShadow: 'inset 0 0 40px rgba(99,102,241,0.1)',
                        } : {}),
                        ...(pendingPlaceFieldId ? {
                            cursor: 'crosshair',
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
                            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
                            justifyContent: 'center', pointerEvents: 'none', zIndex: 50,
                        }}>
                            <div style={{
                                padding: '0.75rem 1.5rem', borderRadius: '12px',
                                background: 'rgba(99,102,241,0.9)', color: 'white',
                                fontSize: '0.9rem', fontWeight: 600,
                                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                            }}>
                                {locale === 'ar' ? '📌 أفلت هنا' : '📌 Hier ablegen'}
                            </div>
                        </div>
                    )}

                    {/* Empty state */}
                    {textBoxes.length === 0 && !dragOverImage && !pendingPlaceFieldId && (
                        <div style={{
                            position: 'absolute', top: '50%', left: '50%',
                            transform: 'translate(-50%, -50%)',
                            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
                            padding: isMobile ? '1.2rem' : '2rem',
                            borderRadius: '16px', textAlign: 'center', zIndex: 100,
                            maxWidth: isMobile ? '280px' : '380px',
                            border: '1px solid var(--glass-border)', pointerEvents: 'auto',
                        }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                                {isMobile ? '👆' : '🖱️'}
                            </div>
                            <h3 style={{ color: 'var(--color-primary-400)', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                                {locale === 'ar' ? 'كيفية الاستخدام' : 'Anleitung'}
                            </h3>
                            <div style={{
                                color: 'var(--color-neutral-300)', fontSize: '0.8rem', lineHeight: 1.6,
                                textAlign: locale === 'ar' ? 'right' : 'left',
                            }}>
                                {isMobile ? (
                                    <>
                                        <p style={{ margin: '0.3rem 0' }}>1️⃣ {locale === 'ar' ? 'افتح الأسئلة 📋 واكتب إجاباتك' : 'Fragen 📋 öffnen & Antworten eingeben'}</p>
                                        <p style={{ margin: '0.3rem 0' }}>2️⃣ {locale === 'ar' ? 'اضغط 📌 ثم اضغط على النموذج' : '📌 tippen, dann auf Formular tippen'}</p>
                                        <p style={{ margin: '0.3rem 0' }}>3️⃣ {locale === 'ar' ? 'أو اضغط "وضع الكل"' : 'Oder "Alle platzieren" nutzen'}</p>
                                    </>
                                ) : (
                                    <>
                                        <p style={{ margin: '0.3rem 0' }}>1️⃣ {locale === 'ar' ? 'اكتب إجاباتك في الشريط الجانبي' : 'Antworten in Seitenleiste eingeben'}</p>
                                        <p style={{ margin: '0.3rem 0' }}>2️⃣ {locale === 'ar' ? 'اسحب الإجابة وأفلتها على النموذج' : 'Antwort auf Formular ziehen & ablegen'}</p>
                                        <p style={{ margin: '0.3rem 0' }}>3️⃣ {locale === 'ar' ? 'أو اضغط "وضع الكل"' : 'Oder "Alle platzieren" nutzen'}</p>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Form Image + Text Boxes */}
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <img
                            ref={imageRef}
                            src={imageBase64}
                            alt="Form"
                            onClick={handleImageTap}
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
                                    userSelect: 'none',
                                    position: 'absolute',
                                    left: `${box.x}%`,
                                    top: `${box.y}%`,
                                    zIndex: selectedBoxId === box.id ? 20 : 10,
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
                                        {/* Drag Handle */}
                                        {selectedBoxId === box.id && (
                                            <div
                                                onMouseDown={(e) => handleBoxStart(e, box.id)}
                                                onTouchStart={(e) => handleBoxStart(e, box.id)}
                                                style={{
                                                    position: 'absolute', top: '-22px', left: 0,
                                                    background: 'var(--color-primary-600)',
                                                    borderRadius: '4px 4px 0 0', padding: '1px 6px',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    cursor: 'grab', zIndex: 30, color: 'white',
                                                    fontSize: '11px', whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {box.arabicQuestion ? (
                                                    <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {box.arabicQuestion}
                                                    </span>
                                                ) : <span>✋</span>}
                                            </div>
                                        )}

                                        {/* Question label for empty boxes */}
                                        {!box.text && box.arabicQuestion && selectedBoxId !== box.id && (
                                            <div style={{
                                                position: 'absolute', top: '-18px', right: 0,
                                                color: 'var(--color-primary-300)', fontSize: '10px',
                                                background: 'rgba(0,0,0,0.6)', padding: '1px 4px',
                                                borderRadius: '4px', pointerEvents: 'none',
                                                whiteSpace: 'nowrap', maxWidth: '160px',
                                                overflow: 'hidden', textOverflow: 'ellipsis', direction: 'rtl',
                                            }}>
                                                {box.arabicQuestion}
                                            </div>
                                        )}

                                        <textarea
                                            value={box.text}
                                            dir="auto"
                                            placeholder={box.arabicQuestion || (locale === 'ar' ? 'اكتب...' : 'Schreiben...')}
                                            onChange={(e) => handleTextChange(box.id, e.target.value)}
                                            onClick={(e) => { e.stopPropagation(); setSelectedBoxId(box.id); }}
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.75)',
                                                border: selectedBoxId === box.id
                                                    ? '2px solid var(--color-primary-500)'
                                                    : '1px solid rgba(0,0,0,0.2)',
                                                borderRadius: '3px',
                                                padding: '2px 4px',
                                                fontSize: `${box.fontSize}px`,
                                                fontFamily: 'Arial, sans-serif',
                                                color: '#000',
                                                fontWeight: 'bold',
                                                minWidth: '50px',
                                                minHeight: '24px',
                                                outline: 'none',
                                                resize: 'both',
                                                overflow: 'hidden',
                                                whiteSpace: 'pre-wrap',
                                                width: box.width ? `${box.width}px` : (box.text ? 'auto' : '100px'),
                                                lineHeight: '1.1',
                                                verticalAlign: 'top',
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
                                            position: 'absolute', top: '-18px', right: '-18px',
                                            width: '20px', height: '20px', borderRadius: '50%',
                                            background: '#ef4444', color: 'white', border: 'none',
                                            cursor: 'pointer', fontSize: '12px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            zIndex: 30, boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
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
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: isMobile ? '1rem' : 0,
                }}>
                    <div className="glass-card" style={{ padding: isMobile ? '1rem' : '2rem', width: '90%', maxWidth: '500px' }}>
                        <h3 style={{ marginBottom: '0.75rem', color: 'white', fontSize: isMobile ? '1rem' : '1.2rem' }}>
                            {locale === 'ar' ? 'توقيع' : 'Unterschrift'}
                        </h3>
                        <div style={{ background: 'white', borderRadius: '4px', overflow: 'hidden' }}>
                            <SignatureCanvas
                                ref={sigCanvasRef}
                                canvasProps={{
                                    width: isMobile ? 300 : 450,
                                    height: isMobile ? 150 : 200,
                                    className: 'sigCanvas',
                                    style: { width: '100%', height: isMobile ? '150px' : '200px' }
                                }}
                                backgroundColor="rgba(255,255,255,0)"
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            <button className="btn btn-secondary" onClick={() => sigCanvasRef.current?.clear()}
                                style={{ fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                                {locale === 'ar' ? 'مسح' : 'Löschen'}
                            </button>
                            <button className="btn btn-secondary" onClick={() => setShowSignatureModal(false)}
                                style={{ fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                                {locale === 'ar' ? 'إلغاء' : 'Abbrechen'}
                            </button>
                            <button className="btn btn-primary" onClick={handleSaveSignature}
                                style={{ fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                                {locale === 'ar' ? 'حفظ' : 'Speichern'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
