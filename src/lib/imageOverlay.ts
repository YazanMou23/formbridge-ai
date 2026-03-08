// ═══════════════════════════════════════════════════════════════════════════
// FormBridge AI - Image Overlay Utility
// Overlays German answers onto the original form image with PRECISE positioning
// ═══════════════════════════════════════════════════════════════════════════

import type { FieldPosition } from '@/types';

export interface FieldWithAnswer {
    germanAnswer: string;
    position?: FieldPosition;
    prefilled?: boolean;         // Whether this field was already filled
    existingValue?: string | null; // Original value if pre-filled
    directPlacement?: boolean;   // If true, text is drawn AT (x,y) with no offset
    fieldFontSize?: number;      // Per-field font size override
}

export interface OverlayOptions {
    imageBase64: string;
    fields: FieldWithAnswer[];
    fontSize?: number;
    fontColor?: string;
    fontFamily?: string;
    showBackground?: boolean;  // Optional background behind text
    debugMode?: boolean;       // Show field boundaries for debugging
    verticalOffset?: number;   // Fine-tune vertical positioning (% adjustment)
    horizontalOffset?: number; // Fine-tune horizontal positioning (% adjustment)
    skipPrefilled?: boolean;   // Skip fields that were already filled
}

/**
 * Overlays text answers onto the original form image
 * Returns a new base64 image with the text overlaid
 */
export async function overlayFieldsOnImage(options: OverlayOptions): Promise<string> {
    const {
        imageBase64,
        fields,
        fontSize = 14,
        fontColor = '#000000',
        fontFamily = 'Arial, Helvetica, sans-serif',
        showBackground = false,
        debugMode = false,
        verticalOffset = 0,
        horizontalOffset = 0,
        skipPrefilled = true,  // By default, skip pre-filled fields
    } = options;

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            // Create canvas with same dimensions as image
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }

            // Draw the original image
            ctx.drawImage(img, 0, 0);

            // Calculate a base font size relative to image dimensions
            // Typical form is ~800-1200px, scale font accordingly
            const baseFontScale = Math.min(img.width, img.height) / 900;
            const scaledFontSize = Math.max(12, fontSize * baseFontScale);

            // Overlay each field's answer
            fields.forEach((field, fieldIndex) => {
                // Skip if no position or answer
                if (!field.position || !field.germanAnswer) return;

                // Skip pre-filled fields unless specifically showing them
                if (skipPrefilled && field.prefilled && field.existingValue) {
                    return;
                }

                const { x, y, width, height } = field.position;

                // Convert percentage to pixels with offset adjustments
                const pixelX = ((x + horizontalOffset) / 100) * img.width;
                const pixelY = ((y + verticalOffset) / 100) * img.height;
                const pixelWidth = (width / 100) * img.width;
                const pixelHeight = (height / 100) * img.height;

                // ── Direct Placement Mode ──
                // When the user manually placed text in the editor via drag-and-drop,
                // the (x,y) represents exactly where the text should appear.
                // No box-based offset or wrapping is applied.
                if (field.directPlacement) {
                    const directFontSize = field.fieldFontSize
                        ? Math.max(10, field.fieldFontSize * baseFontScale)
                        : Math.max(10, scaledFontSize);

                    ctx.font = `bold ${directFontSize}px ${fontFamily}`;
                    ctx.textBaseline = 'top';
                    ctx.textAlign = 'left';
                    ctx.fillStyle = fontColor;

                    if (debugMode) {
                        ctx.strokeStyle = 'rgba(0, 128, 255, 0.8)';
                        ctx.lineWidth = 1;
                        ctx.strokeRect(pixelX, pixelY, pixelWidth || 100, pixelHeight || 20);
                        ctx.fillStyle = 'rgba(0, 128, 255, 0.9)';
                        ctx.font = 'bold 10px Arial';
                        ctx.fillText(`#${fieldIndex + 1} (direct)`, pixelX, pixelY - 12);
                        ctx.fillStyle = fontColor;
                        ctx.font = `bold ${directFontSize}px ${fontFamily}`;
                    }

                    ctx.fillText(field.germanAnswer, pixelX, pixelY);
                    return;
                }

                // ── Standard Field-box Mode ──
                // For AI-detected fields: x,y is the top-left of the field box,
                // and text is positioned inside the box.

                // Debug mode: draw field boundaries
                if (debugMode) {
                    ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(pixelX, pixelY, pixelWidth, pixelHeight);

                    // Draw field number for reference
                    ctx.fillStyle = 'rgba(255, 0, 0, 0.9)';
                    ctx.font = 'bold 12px Arial';
                    ctx.fillText(`#${fieldIndex + 1}`, pixelX + 2, pixelY - 4);
                }

                // --- Improved Font Sizing & Positioning ---

                // Calculate max font size that fits in the box height (with some padding)
                const maxFontHeight = pixelHeight * 0.75; // Use 75% of box height
                // Use the smaller of: global scaled font size OR box-constrained font size
                // But ensure it doesn't get ridiculously small (min 8px)
                const finalFontSize = Math.max(10, Math.min(scaledFontSize, maxFontHeight));

                ctx.font = `${finalFontSize}px ${fontFamily}`;
                // Use 'alphabetic' baseline — text sits on the line like real handwriting
                ctx.textBaseline = 'alphabetic';
                ctx.textAlign = 'left';
                ctx.fillStyle = fontColor;

                // Fixed small horizontal padding (3px) — avoids text touching field border
                const paddingX = 3;

                const textX = pixelX + paddingX;
                // Position text at ~78% of the field height from the top.
                // This places the text baseline near the bottom of the field,
                // matching how answers are written on form lines.
                const textY = pixelY + (pixelHeight * 0.78);

                const maxTextWidth = Math.max(0, pixelWidth - (paddingX * 2));

                // Optional: Draw background
                if (showBackground) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                    ctx.fillRect(pixelX, pixelY, pixelWidth, pixelHeight);
                    ctx.fillStyle = fontColor; // Restore text color
                }

                // Check text width
                const metrics = ctx.measureText(field.germanAnswer);

                if (metrics.width > maxTextWidth) {
                    // Multi-line handling
                    const words = field.germanAnswer.split(' ');
                    const lines: string[] = [];
                    let line = '';

                    for (let n = 0; n < words.length; n++) {
                        const testLine = line + words[n] + ' ';
                        const testMetrics = ctx.measureText(testLine);
                        if (testMetrics.width > maxTextWidth && n > 0) {
                            lines.push(line.trim());
                            line = words[n] + ' ';
                        } else {
                            line = testLine;
                        }
                    }
                    lines.push(line.trim());

                    const lineHeight = finalFontSize * 1.2;
                    const totalHeight = lines.length * lineHeight;

                    ctx.textBaseline = 'top';
                    let currentY = pixelY + Math.max(2, (pixelHeight - totalHeight) / 2);

                    if (totalHeight > pixelHeight) {
                        currentY = pixelY + 2;
                    }

                    lines.forEach(l => {
                        ctx.fillText(l, textX, currentY);
                        currentY += lineHeight;
                    });

                    ctx.textBaseline = 'alphabetic';

                } else {
                    // Single line — text sits on the baseline at ~78% of box height
                    ctx.fillText(field.germanAnswer, textX, textY);
                }
            });

            // Convert canvas to base64
            const filledImageBase64 = canvas.toDataURL('image/png', 1.0);
            resolve(filledImageBase64);
        };

        img.onerror = () => {
            reject(new Error('Failed to load image'));
        };

        img.src = imageBase64;
    });
}

/**
 * Generates a PDF from the filled form image
 */
export async function generateFilledFormPDF(imageBase64: string, filename?: string): Promise<void> {
    const { jsPDF } = await import('jspdf');

    // Load image to get dimensions
    const img = new Image();
    img.src = imageBase64;

    await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
    });

    // Calculate PDF dimensions (A4 or fit to image aspect ratio)
    const aspectRatio = img.width / img.height;
    let pdfWidth: number;
    let pdfHeight: number;

    if (aspectRatio > 1) {
        // Landscape
        pdfWidth = 297; // A4 width in mm (landscape)
        pdfHeight = pdfWidth / aspectRatio;
    } else {
        // Portrait
        pdfHeight = 297; // A4 height in mm
        pdfWidth = pdfHeight * aspectRatio;
    }

    const doc = new jsPDF({
        orientation: aspectRatio > 1 ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight],
    });

    // Add the image to fill the page
    doc.addImage(imageBase64, 'PNG', 0, 0, pdfWidth, pdfHeight);

    // Save
    const name = filename || `ausgefuelltes_formular_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(name);
}
