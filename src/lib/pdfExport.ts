// ═══════════════════════════════════════════════════════════════════════════
// FormBridge AI - PDF Export Utility
// ═══════════════════════════════════════════════════════════════════════════

import { jsPDF } from 'jspdf';
import type { FilledField } from '@/types';

export interface PDFExportOptions {
    title?: string;
    subtitle?: string;
    fields: FilledField[];
    generatedAt: string;
}

export function generatePDF(options: PDFExportOptions): void {
    const { title = 'Ausgefülltes Formular', subtitle, fields, generatedAt } = options;

    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let yPos = margin;

    // Header
    doc.setFillColor(15, 23, 42); // Dark blue
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('FormBridge AI', margin, 18);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(title, margin, 28);

    if (subtitle) {
        doc.text(subtitle, margin, 35);
    }

    yPos = 55;

    // Date
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    const date = new Date(generatedAt).toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
    doc.text(`Erstellt am: ${date}`, margin, yPos);
    yPos += 15;

    // Fields
    doc.setTextColor(30, 41, 59);

    fields.forEach((field, index) => {
        // Check if we need a new page
        if (yPos > 260) {
            doc.addPage();
            yPos = margin;
        }

        // Field number badge
        doc.setFillColor(0, 98, 230);
        doc.circle(margin + 4, yPos, 4, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.text(String(index + 1), margin + 2.5, yPos + 1.5);

        // Question label
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(field.germanQuestion, margin + 12, yPos);
        yPos += 6;

        // Answer
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');

        const lines = doc.splitTextToSize(field.germanAnswer || '—', contentWidth - 12);
        doc.text(lines, margin + 12, yPos);
        yPos += lines.length * 5 + 8;

        // Separator line
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.2);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 8;
    });

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Generiert mit FormBridge AI - Ihr intelligenter Formular-Assistent', margin, footerY);
    doc.text(`Seite 1`, pageWidth - margin - 15, footerY);

    // Save
    const filename = `formular_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
}

export function generateTextFile(fields: FilledField[]): void {
    const content = fields
        .map((f, i) => `${i + 1}. ${f.germanQuestion}\n   Antwort: ${f.germanAnswer}`)
        .join('\n\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `formular_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}
