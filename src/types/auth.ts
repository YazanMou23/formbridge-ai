// ═══════════════════════════════════════════════════════════════════════════
// FormBridge AI - Authentication Types
// ═══════════════════════════════════════════════════════════════════════════

export interface User {
    id: string;
    email: string;
    name: string;
    credits: number;
    createdAt: string;
    isVerified?: boolean;
    verificationToken?: string;
    deviceId?: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    user?: User;
    token?: string;
    error?: string;
}
