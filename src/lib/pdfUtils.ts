import { validateImage } from './imageUtils';

export async function convertPdfToImage(file: File): Promise<string> {
    // Dynamically import pdfjs-dist
    const pdfjsLib = await import('pdfjs-dist');
    // Set worker source
    // Use unpkg as it reliably mirrors npm package structure
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1); // Get first page

    const viewport = page.getViewport({ scale: 1.5 }); // Balanced quality scaling
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
        throw new Error('Canvas context not available');
    }

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({
        canvasContext: context,
        viewport: viewport
    }).promise;

    return canvas.toDataURL('image/png');
}

export async function handleFileSelection(file: File): Promise<{ file: File, base64: string }> {
    if (file.type === 'application/pdf') {
        const base64 = await convertPdfToImage(file);
        // Create a new File object from the base64 string (optional, keeps consistency)
        // For now, we return the original file but the base64 is the IMAGE representation
        // This trick allows existing image-based components to work with the PDF visual
        return { file, base64 };
    } else {
        // Standard image handling
        const validation = validateImage(file);
        if (!validation.valid) {
            throw new Error(validation.error);
        }

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve({ file, base64: reader.result as string });
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }
}
