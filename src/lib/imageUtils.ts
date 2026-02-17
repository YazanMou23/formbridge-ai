// ═══════════════════════════════════════════════════════════════════════════
// FormBridge AI - Image Processing Utilities (In-Memory Only)
// ═══════════════════════════════════════════════════════════════════════════

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export interface ImageValidationResult {
    valid: boolean;
    error?: 'invalidFormat' | 'fileTooLarge';
}

export function validateImage(file: File): ImageValidationResult {
    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
        return { valid: false, error: 'invalidFormat' };
    }
    if (file.size > MAX_FILE_SIZE) {
        return { valid: false, error: 'fileTooLarge' };
    }
    return { valid: true };
}

export function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

export function getBase64Data(dataUrl: string): string {
    const commaIndex = dataUrl.indexOf(',');
    return commaIndex !== -1 ? dataUrl.substring(commaIndex + 1) : dataUrl;
}

export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
