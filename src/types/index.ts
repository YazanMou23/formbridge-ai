// ═══════════════════════════════════════════════════════════════════════════
// FormBridge AI - Type Definitions
// ═══════════════════════════════════════════════════════════════════════════

export type Locale = 'de' | 'ar';

export type AppStep = 'upload' | 'questions' | 'result';

// ─────────────────── Form Field Types ───────────────────
export interface FieldPosition {
    // Position as percentage of image dimensions (0-100)
    x: number;      // Left position percentage
    y: number;      // Top position percentage
    width: number;  // Width percentage
    height: number; // Height percentage
}

export interface FormField {
    id: string;
    germanQuestion: string;      // Original question detected in German
    arabicQuestion: string;      // Translated question for Arabic user
    fieldType: FieldType;        // Type of input expected
    required: boolean;
    placeholder?: string;
    options?: string[];          // For select/radio fields
    position?: FieldPosition;    // Position of the answer field on the form image
    prefilled?: boolean;         // Whether the field already has content
    existingValue?: string | null; // Existing value if field is pre-filled
    confidence?: 'high' | 'medium' | 'low'; // Position detection confidence
}

export type FieldType =
    | 'text'
    | 'textarea'
    | 'date'
    | 'email'
    | 'phone'
    | 'number'
    | 'select'
    | 'radio'
    | 'checkbox';

// ─────────────────── Answer Types ───────────────────
export interface UserAnswer {
    fieldId: string;
    arabicValue: string;         // User's answer in Arabic
    germanValue: string;         // Translated answer in German
}

export interface FormResult {
    fields: FilledField[];
    generatedAt: string;
    creditsUsed: number;
    originalImage?: string;  // Base64 of original uploaded form
}

export interface FilledField {
    id?: string;
    germanQuestion: string;
    germanAnswer: string;
    position?: FieldPosition;  // Position for overlay on original image
    prefilled?: boolean;       // Whether this was a pre-filled field
    existingValue?: string | null; // Original value if pre-filled
}

// ─────────────────── API Types ───────────────────
export interface AnalyzeFormRequest {
    imageBase64: string;
}

export interface AnalyzeFormResponse {
    success: boolean;
    fields: FormField[];
    formTitle?: string;
    error?: string;
}

export interface TranslateAnswersRequest {
    answers: Array<{
        fieldId: string;
        arabicAnswer: string;
        germanQuestion: string;
    }>;
}

export interface TranslateAnswersResponse {
    success: boolean;
    translations: Array<{
        fieldId: string;
        germanAnswer: string;
    }>;
    error?: string;
}

// ─────────────────── Credit System ───────────────────
export interface CreditState {
    balance: number;
    lastUpdated: string;
}

export interface CreditTransaction {
    id: string;
    type: 'debit' | 'credit';
    amount: number;
    description: string;
    timestamp: string;
}

// ─────────────────── Component Props ───────────────────
export interface UploadZoneProps {
    onImageSelected: (file: File, base64: string) => void;
    onImageRemoved: () => void;
    currentImage: string | null;
    isLoading: boolean;
    locale: Locale;
}

export interface QuestionsFormProps {
    fields: FormField[];
    onSubmit: (answers: Record<string, string>) => void;
    isLoading: boolean;
    locale: Locale;
}

export interface ResultPreviewProps {
    result: FormResult;
    onNewForm: () => void;
    locale: Locale;
}

// ─────────────────── Context Types ───────────────────
export interface AppContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    credits: number;
    deductCredits: (amount: number) => boolean;
    step: AppStep;
    setStep: (step: AppStep) => void;
}
