'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { FieldPosition } from '@/types';

interface Field {
    id: string;
    germanQuestion: string;
    position: FieldPosition;
    germanAnswer?: string;
}

interface Props {
    imageBase64: string;
    fields: Field[];
    onPositionsUpdate: (updatedFields: Field[]) => void;
    onClose: () => void;
    locale: 'ar' | 'de';
}

export default function PositionAdjuster({ imageBase64, fields, onPositionsUpdate, onClose, locale }: Props) {
    const [localFields, setLocalFields] = useState<Field[]>(fields);
    const [selectedField, setSelectedField] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const imageRef = useRef<HTMLImageElement>(null);

    // Handle mouse/touch down on a field
    const handleFieldStart = (e: React.MouseEvent | React.TouchEvent, fieldId: string, isResize: boolean = false) => {
        e.stopPropagation();
        setSelectedField(fieldId);

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        setDragStart({ x: clientX, y: clientY });

        if (isResize) {
            setIsResizing(true);
        } else {
            setIsDragging(true);
        }
    };

    // Handle move (mouse/touch)
    const handleMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (!selectedField || (!isDragging && !isResizing) || !imageRef.current) return;

        // Prevent scrolling while dragging on mobile
        if (e.type === 'touchmove') {
            if (e.cancelable) e.preventDefault();
        }

        const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

        const rect = imageRef.current.getBoundingClientRect();
        const deltaX = ((clientX - dragStart.x) / rect.width) * 100;
        const deltaY = ((clientY - dragStart.y) / rect.height) * 100;

        setLocalFields(prev => prev.map(field => {
            if (field.id !== selectedField) return field;

            if (isDragging) {
                // Move the field
                const newX = Math.max(0, Math.min(100 - field.position.width, field.position.x + deltaX));
                const newY = Math.max(0, Math.min(100 - field.position.height, field.position.y + deltaY));
                return {
                    ...field,
                    position: { ...field.position, x: newX, y: newY }
                };
            } else if (isResizing) {
                // Resize the field
                const newWidth = Math.max(5, Math.min(100 - field.position.x, field.position.width + deltaX));
                const newHeight = Math.max(2, Math.min(100 - field.position.y, field.position.height + deltaY));
                return {
                    ...field,
                    position: { ...field.position, width: newWidth, height: newHeight }
                };
            }
            return field;
        }));

        setDragStart({ x: clientX, y: clientY });
    }, [selectedField, isDragging, isResizing, dragStart]);

    // Handle mouse up
    // Handle end (mouse/touch)
    const handleEnd = useCallback(() => {
        setIsDragging(false);
        setIsResizing(false);
    }, []);

    // Click outside to deselect
    const handleBackgroundClick = () => {
        setSelectedField(null);
    };

    // Add/remove event listeners
    useEffect(() => {
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleEnd);
        window.addEventListener('touchmove', handleMove, { passive: false });
        window.addEventListener('touchend', handleEnd);
        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleEnd);
        };
    }, [handleMove, handleEnd]);

    // Handle save
    const handleSave = () => {
        onPositionsUpdate(localFields);
        onClose();
    };

    // Handle reset
    const handleReset = () => {
        setLocalFields(fields);
        setSelectedField(null);
    };

    // Truncate field name for display
    const truncateName = (name: string, maxLength: number = 25) => {
        if (name.length <= maxLength) return name;
        return name.slice(0, maxLength) + '...';
    };

    return (
        <div className="position-adjuster-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.95)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            padding: 'var(--spacing-md)',
        }}>
            {/* Compact Header with buttons only */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--spacing-sm)',
                color: 'white',
                flexWrap: 'wrap',
                gap: 'var(--spacing-sm)',
            }}>
                <h2 style={{ margin: 0, fontSize: '1.1rem' }}>
                    {locale === 'ar' ? 'تعديل مواقع الحقول - اسحب المربعات لنقلها' : 'Feldpositionen anpassen - Boxen ziehen zum Verschieben'}
                </h2>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={handleReset}
                        style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                    >
                        {locale === 'ar' ? 'إعادة تعيين' : 'Zurücksetzen'}
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={onClose}
                        style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                    >
                        {locale === 'ar' ? 'إلغاء' : 'Abbrechen'}
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleSave}
                        style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                    >
                        {locale === 'ar' ? 'حفظ التغييرات' : 'Speichern'}
                    </button>
                </div>
            </div>

            {/* Image with field overlays - takes most of the screen */}
            <div
                onClick={handleBackgroundClick}
                style={{
                    flex: 1,
                    overflow: 'auto',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    background: 'rgba(0,0,0,0.5)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--spacing-sm)',
                    touchAction: 'none', // Prevent browser scrolling
                }}
            >
                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                        ref={imageRef}
                        src={imageBase64}
                        alt="Form"
                        style={{
                            maxWidth: '100%',
                            maxHeight: 'calc(100vh - 120px)',
                            display: 'block',
                        }}
                    />

                    {/* Field overlays with names */}
                    {localFields.map((field) => {
                        const isSelected = field.id === selectedField;
                        return (
                            <div
                                key={field.id}
                                onMouseDown={(e) => handleFieldStart(e, field.id)}
                                onTouchStart={(e) => handleFieldStart(e, field.id)}
                                style={{
                                    position: 'absolute',
                                    left: `${field.position.x}%`,
                                    top: `${field.position.y}%`,
                                    width: `${field.position.width}%`,
                                    height: `${field.position.height}%`,
                                    border: `2px solid ${isSelected ? '#00ff00' : 'rgba(255, 100, 100, 0.9)'}`,
                                    background: isSelected
                                        ? 'rgba(0, 255, 0, 0.15)'
                                        : 'rgba(255, 100, 100, 0.1)',
                                    cursor: isDragging ? 'grabbing' : 'grab',
                                    boxSizing: 'border-box',
                                    borderRadius: '4px',
                                    transition: 'border-color 0.15s, background 0.15s',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    overflow: 'visible', // Changed to visible for close button
                                }}
                            >
                                {/* Delete/Close Button - Top Right */}
                                {isSelected && (
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setLocalFields(prev => prev.filter(f => f.id !== field.id));
                                            if (selectedField === field.id) setSelectedField(null);
                                        }}
                                        onTouchStart={(e) => {
                                            e.stopPropagation();
                                            // Handle touch start for delete button to prevent dragging
                                            setLocalFields(prev => prev.filter(f => f.id !== field.id));
                                            if (selectedField === field.id) setSelectedField(null);
                                        }}
                                        style={{
                                            position: 'absolute',
                                            top: '-12px',
                                            right: '-12px',
                                            width: '24px',
                                            height: '24px',
                                            background: '#ef4444',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: '16px',
                                            cursor: 'pointer',
                                            zIndex: 50,
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                            border: '2px solid white'
                                        }}
                                    >
                                        ×
                                    </div>
                                )}
                                {/* Field name label - positioned above the box */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: '100%',
                                    left: '0',
                                    right: '0',
                                    marginBottom: '2px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                }}>
                                    <span style={{
                                        background: isSelected
                                            ? 'linear-gradient(135deg, #00ff00, #00cc00)'
                                            : 'linear-gradient(135deg, #ff6b6b, #ee5a5a)',
                                        color: isSelected ? '#000' : '#fff',
                                        padding: '2px 6px',
                                        fontSize: '10px',
                                        fontWeight: 600,
                                        borderRadius: '3px',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        maxWidth: '200px',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                    }}>
                                        {truncateName(field.germanQuestion)}
                                    </span>
                                </div>

                                {/* German Answer Preview (if available) */}
                                {field.germanAnswer && (
                                    <div style={{
                                        width: '100%',
                                        height: '100%',
                                        padding: '2px 4px',
                                        fontSize: '11px', // Approximate font size
                                        color: '#000',
                                        fontFamily: 'Arial, sans-serif',
                                        whiteSpace: 'pre-wrap',
                                        overflow: 'hidden',
                                        lineHeight: '1.2',
                                        pointerEvents: 'none', // Allow clicking through to the box
                                    }}>
                                        {field.germanAnswer}
                                    </div>
                                )}

                                {/* Resize handle - bottom right corner */}
                                <div
                                    onMouseDown={(e) => handleFieldStart(e, field.id, true)}
                                    onTouchStart={(e) => handleFieldStart(e, field.id, true)}
                                    style={{
                                        position: 'absolute',
                                        bottom: '-6px',
                                        right: '-6px',
                                        width: '14px',
                                        height: '14px',
                                        background: isSelected
                                            ? 'linear-gradient(135deg, #00ff00, #00cc00)'
                                            : 'linear-gradient(135deg, #ff6b6b, #ee5a5a)',
                                        cursor: 'nwse-resize',
                                        borderRadius: '3px',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                        border: '2px solid white',
                                    }}
                                />

                                {/* Move indicator in center when selected */}
                                {isSelected && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        background: 'rgba(0,0,0,0.6)',
                                        borderRadius: '4px',
                                        padding: '4px 8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                    }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                            <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20" />
                                        </svg>
                                        <span style={{ color: 'white', fontSize: '10px' }}>
                                            {locale === 'ar' ? 'اسحب' : 'Ziehen'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Selected field info bar at bottom */}
            {selectedField && (
                <div style={{
                    marginTop: 'var(--spacing-sm)',
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    background: 'linear-gradient(135deg, rgba(0, 255, 0, 0.2), rgba(0, 200, 0, 0.1))',
                    border: '1px solid rgba(0, 255, 0, 0.4)',
                    borderRadius: 'var(--radius-md)',
                    color: 'white',
                    fontSize: '0.875rem',
                }}>
                    {(() => {
                        const field = localFields.find(f => f.id === selectedField);
                        if (!field) return null;
                        return (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <span style={{ color: '#00ff00', fontWeight: 600 }}>
                                    ✓ {field.germanQuestion}
                                </span>
                                <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>
                                    X: {field.position.x.toFixed(1)}% |
                                    Y: {field.position.y.toFixed(1)}% |
                                    W: {field.position.width.toFixed(1)}% |
                                    H: {field.position.height.toFixed(1)}%
                                </span>
                            </div>
                        );
                    })()}
                </div>
            )}
        </div>
    );
}
